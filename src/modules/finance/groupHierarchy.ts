/**
 * Hierarchy rules for picking groups.
 *
 * Groups form a tree — Region → FOB → Location → Zone → Missional Community —
 * and a person sits on one path through it. A flat picker lets someone choose a
 * Zone from one Location and a FOB from another, which is not a real place
 * anyone belongs to. These helpers keep a selection coherent:
 *
 *   - choosing a Zone selects its Location and FOB too, because a Zone belongs
 *     to exactly one of each
 *   - choosing a Location narrows the Zones on offer to that Location's own
 *   - clearing a Location clears the Zones underneath it, rather than leaving
 *     them stranded without a parent
 *
 * Pure and tree-shaped so the behaviour can be tested without a browser.
 *
 * NOTE: not wired into a screen yet. The campus picker that consumes it was
 * deferred to its own change; these rules and their tests are kept here so that
 * work starts from a tested base rather than a blank file.
 */

export interface GroupTreeNode {
  id: number;
  name: string;
  children?: GroupTreeNode[];
}

export interface GroupOption {
  id: number;
  name: string;
  parentId: number | null;
  parentName?: string;
  /** 0 for a root group, increasing down the tree. */
  depth: number;
}

/** Flattens the tree into pickable options, remembering each group's parent. */
export const flattenGroupTree = (
  nodes: GroupTreeNode[] | undefined,
  parent: { id: number; name: string } | null = null,
  depth = 0,
): GroupOption[] => {
  const out: GroupOption[] = [];
  for (const node of nodes ?? []) {
    out.push({
      id: node.id,
      name: node.name,
      parentId: parent?.id ?? null,
      parentName: parent?.name,
      depth,
    });
    if (node.children?.length) {
      out.push(
        ...flattenGroupTree(node.children, { id: node.id, name: node.name }, depth + 1),
      );
    }
  }
  return out;
};

/** Index for constant-time parent lookups. */
export const indexGroups = (
  options: GroupOption[],
): Map<number, GroupOption> => new Map(options.map((o) => [o.id, o]));

/** Every ancestor of a group, nearest first. */
export const ancestorsOf = (
  id: number,
  byId: Map<number, GroupOption>,
): number[] => {
  const out: number[] = [];
  const seen = new Set<number>([id]);
  let current = byId.get(id)?.parentId ?? null;
  while (current !== null && !seen.has(current)) {
    seen.add(current);
    out.push(current);
    current = byId.get(current)?.parentId ?? null;
  }
  return out;
};

const isDescendantOf = (
  id: number,
  ancestorId: number,
  byId: Map<number, GroupOption>,
): boolean => ancestorsOf(id, byId).includes(ancestorId);

/**
 * The selection implied by what the user just picked: their choices plus every
 * ancestor. Picking a Zone therefore also records its Location and FOB.
 */
export const withAncestors = (
  selectedIds: number[],
  byId: Map<number, GroupOption>,
): number[] => {
  const out = new Set<number>();
  for (const id of selectedIds) {
    out.add(id);
    ancestorsOf(id, byId).forEach((a) => out.add(a));
  }
  return [...out];
};

/**
 * Removing a group removes everything beneath it too.
 *
 * Dropping a Location while keeping one of its Zones would leave a selection
 * that no longer says where the person actually meets.
 */
export const removeWithDescendants = (
  removedId: number,
  selectedIds: number[],
  byId: Map<number, GroupOption>,
): number[] =>
  selectedIds.filter(
    (id) => id !== removedId && !isDescendantOf(id, removedId, byId),
  );

/**
 * Reconciles a raw selection from the picker into a coherent one.
 *
 * Additions pull in their ancestors; removals take their descendants with them.
 * Which happened is worked out by comparing against the previous selection.
 */
export const reconcileSelection = (
  previousIds: number[],
  nextIds: number[],
  byId: Map<number, GroupOption>,
): number[] => {
  const removed = previousIds.filter((id) => !nextIds.includes(id));
  let result = withAncestors(nextIds, byId);
  for (const id of removed) {
    result = removeWithDescendants(id, result, byId);
  }
  return result;
};

/**
 * The options still worth offering, given what is already selected.
 *
 * Once a group is chosen, its siblings — and everything under them — describe a
 * different part of the church, so they are dropped. Picking "WH Arua" as the
 * Location leaves only WH Arua's Zones on the list. Branches that do not
 * compete with anything selected are untouched, so a serving team elsewhere in
 * the tree is still reachable.
 */
export const availableOptions = (
  options: GroupOption[],
  selectedIds: number[],
  byId: Map<number, GroupOption>,
): GroupOption[] => {
  if (selectedIds.length === 0) return options;

  const selected = new Set(selectedIds);
  const blocked = new Set<number>();

  for (const id of selectedIds) {
    const parentId = byId.get(id)?.parentId ?? null;
    for (const option of options) {
      if (option.id === id) continue;
      if (selected.has(option.id)) continue;
      if (option.parentId === parentId) blocked.add(option.id);
    }
  }

  if (blocked.size === 0) return options;

  return options.filter((option) => {
    if (selected.has(option.id)) return true;
    if (blocked.has(option.id)) return false;
    // Anything under a blocked sibling is out of scope as well.
    return !ancestorsOf(option.id, byId).some((a) => blocked.has(a));
  });
};
