#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const clientRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const serverRoot = path.resolve(clientRoot, "..", "dice-server");
const clientProtocolDir = path.join(clientRoot, "src", "network", "protocol");
const serverProtocolDir = path.join(serverRoot, "src", "net", "protocol");
const optionalMarker = /^\/\/[^\r\n]*\bDUPLICATE\b/;
const sharedPhysicsConstants = [
  "WORLD_GRAVITY",
  "TABLE_WIDTH",
  "TABLE_DEPTH",
  "TABLE_THICKNESS",
  "WALL_HEIGHT",
  "WALL_THICKNESS",
  "WALL_INSET",
  "DICE_COUNT",
  "DICE_HALF_SIZE",
  "DICE_MASS",
  "DICE_SPACING",
  "DICE_LINEAR_DAMPING",
  "DICE_ANGULAR_DAMPING",
  "DICE_TABLE_FRICTION",
  "DICE_TABLE_RESTITUTION",
  "DICE_TABLE_CONTACT_STIFFNESS",
  "DICE_TABLE_CONTACT_RELAXATION",
  "DICE_DICE_FRICTION",
  "DICE_DICE_RESTITUTION",
  "DICE_CONTACT_MIN_HORIZONTAL_NORMAL",
  "DICE_DICE_CONTACT_KICK_SPEED",
  "DICE_DICE_CONTACT_KICK_MAX_DELTA",
  "DICE_EDGE_REPULSION_DISTANCE",
  "DICE_EDGE_REPULSION_FORCE",
  "DICE_EDGE_REPULSION_KICK_SPEED",
  "DICE_REROLL_FALL_Y",
  "DICE_BOTTOM_MAGNET_TORQUE",
  "DICE_BOTTOM_MAGNET_MAX_HEIGHT",
  "REST_FACE_DOT_MIN",
  "REST_STACKED_CENTER_Y_MIN",
  "REST_CORRECTION_MAX_PASSES",
  "REST_CORRECTION_DOWNWARD_VELOCITY",
  "REST_CORRECTION_ANGULAR_VELOCITY",
  "REST_CORRECTION_LIFT",
  "REST_REROLL_POSITION_ATTEMPTS",
  "REST_REROLL_CLEARANCE",
  "HOLD_HEIGHT",
  "THROW_POSITION_PADDING",
  "THROW_MAX_SPEED",
  "THROW_ANGULAR_RANDOM",
  "THROW_SELF_SPIN_MIN",
  "THROW_SELF_SPIN_MAX",
  "THROW_ANGULAR_DIE_VARIATION",
  "TARGET_SCORE",
];

const exists = async (target) => {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
};

const comparableSource = (source) => {
  const newline = source.indexOf("\n");
  const firstLine = (
    newline === -1 ? source : source.slice(0, newline)
  ).replace(/\r$/, "");
  if (!optionalMarker.test(firstLine)) return source;
  return newline === -1 ? "" : source.slice(newline + 1);
};

const protocolFiles = async (directory) =>
  (await readdir(directory))
    .filter((file) => file.endsWith(".ts") && !file.endsWith(".spec.ts"))
    .sort();

const differenceLocation = (left, right) => {
  const length = Math.min(left.length, right.length);
  let index = 0;
  while (index < length && left[index] === right[index]) index += 1;
  const prefix = left.slice(0, index);
  const line = prefix.split("\n").length;
  const lastNewline = prefix.lastIndexOf("\n");
  return { line, column: index - lastNewline };
};

const mismatches = [];

const comparePair = async (label, clientFile, serverFile) => {
  const [clientSource, serverSource] = await Promise.all([
    readFile(clientFile, "utf8"),
    readFile(serverFile, "utf8"),
  ]);
  const clientComparable = comparableSource(clientSource);
  const serverComparable = comparableSource(serverSource);
  if (clientComparable === serverComparable) return;
  const location = differenceLocation(clientComparable, serverComparable);
  mismatches.push(
    `${label} differs at normalized ${location.line}:${location.column}`,
  );
};

const exportedConstInitializers = (source, fileName) => {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const initializers = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const exported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!exported || !(statement.declarationList.flags & ts.NodeFlags.Const)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      initializers.set(
        declaration.name.text,
        declaration.initializer.getText(sourceFile).replace(/\s+/g, ""),
      );
    }
  }
  return initializers;
};

const comparePhysicsConfig = async () => {
  const clientFile = path.join(clientRoot, "src", "engine", "config.ts");
  const serverFile = path.join(serverRoot, "src", "engine", "config.ts");
  const [clientSource, serverSource] = await Promise.all([
    readFile(clientFile, "utf8"),
    readFile(serverFile, "utf8"),
  ]);
  const clientConstants = exportedConstInitializers(clientSource, clientFile);
  const serverConstants = exportedConstInitializers(serverSource, serverFile);
  for (const name of sharedPhysicsConstants) {
    const clientValue = clientConstants.get(name);
    const serverValue = serverConstants.get(name);
    if (clientValue === undefined || serverValue === undefined) {
      const missingSide = clientValue === undefined ? "client" : "server";
      mismatches.push(`physics constant ${name} is missing from ${missingSide}`);
    } else if (clientValue !== serverValue) {
      mismatches.push(
        `physics constant ${name} differs: client=${clientValue}, server=${serverValue}`,
      );
    }
  }
};

const main = async () => {
  if (!(await exists(serverRoot))) {
    console.log(
      `sync check skipped: sibling server not found at ${serverRoot}`,
    );
    return;
  }

  const [clientFiles, serverFiles] = await Promise.all([
    protocolFiles(clientProtocolDir),
    protocolFiles(serverProtocolDir),
  ]);
  const allProtocolFiles = [
    ...new Set([...clientFiles, ...serverFiles]),
  ].sort();

  for (const file of allProtocolFiles) {
    if (!clientFiles.includes(file) || !serverFiles.includes(file)) {
      const missingSide = clientFiles.includes(file) ? "server" : "client";
      mismatches.push(`protocol/${file} is missing from ${missingSide}`);
      continue;
    }
    await comparePair(
      `protocol/${file}`,
      path.join(clientProtocolDir, file),
      path.join(serverProtocolDir, file),
    );
  }

  await comparePair(
    "domain/scorer.ts",
    path.join(clientRoot, "src", "domain", "scorer.ts"),
    path.join(serverRoot, "src", "domain", "scorer.ts"),
  );
  await comparePhysicsConfig();

  if (mismatches.length > 0) {
    console.error("client/server sync check failed:");
    for (const mismatch of mismatches) console.error(`- ${mismatch}`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `client/server sync check passed (${allProtocolFiles.length} protocol files + scorer + ${sharedPhysicsConstants.length} physics constants)`,
  );
};

main().catch((error) => {
  console.error(
    `sync check failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
