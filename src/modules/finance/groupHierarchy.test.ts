import { describe, expect, it } from 'vitest';
import {
  ancestorsOf,
  availableOptions,
  flattenGroupTree,
  indexGroups,
  reconcileSelection,
  removeWithDescendants,
  withAncestors,
} from './groupHierarchy';

/**
 * A slice of the real Worship Harvest shape:
 *
 *   Worship Harvest Global
 *     ├── Kitukutwe FOB
 *     │     ├── WH Arua          ├── Arua Zone A
 *     │     │                    └── Arua Zone B
 *     │     └── WH Entebbe       └── Entebbe Zone
 *     └── Makerere FOB
 *           └── WH Makerere      └── Makerere Zone
 */
const TREE = [
  {
    id: 1,
    name: 'Worship Harvest Global',
    children: [
      {
        id: 10,
        name: 'Kitukutwe FOB',
        children: [
          {
            id: 100,
            name: 'WH Arua',
            children: [
              { id: 1000, name: 'Arua Zone A' },
              { id: 1001, name: 'Arua Zone B' },
            ],
          },
          {
            id: 101,
            name: 'WH Entebbe',
            children: [{ id: 1010, name: 'Entebbe Zone' }],
          },
        ],
      },
      {
        id: 11,
        name: 'Makerere FOB',
        children: [
          {
            id: 110,
            name: 'WH Makerere',
            children: [{ id: 1100, name: 'Makerere Zone' }],
          },
        ],
      },
    ],
  },
];

const options = flattenGroupTree(TREE);
const byId = indexGroups(options);
const names = (ids: number[]) =>
  ids.map((id) => byId.get(id)?.name).sort();

describe('flattenGroupTree', () => {
  it("records each group's parent and depth", () => {
    // 1 root + 2 FOBs + 3 locations + 4 zones
    expect(options).toHaveLength(10);
    expect(byId.get(1000)).toMatchObject({
      name: 'Arua Zone A',
      parentId: 100,
      parentName: 'WH Arua',
      depth: 3,
    });
    expect(byId.get(1)?.parentId).toBeNull();
  });
});

describe('ancestorsOf', () => {
  it('walks from the group up to the root', () => {
    expect(ancestorsOf(1000, byId)).toEqual([100, 10, 1]);
    expect(ancestorsOf(1, byId)).toEqual([]);
  });
});

describe('withAncestors', () => {
  it('selecting a zone also selects its location and FOB', () => {
    expect(names(withAncestors([1000], byId))).toEqual([
      'Arua Zone A',
      'Kitukutwe FOB',
      'WH Arua',
      'Worship Harvest Global',
    ]);
  });

  it('selecting a location also selects its FOB', () => {
    expect(names(withAncestors([100], byId))).toEqual([
      'Kitukutwe FOB',
      'WH Arua',
      'Worship Harvest Global',
    ]);
  });
});

describe('availableOptions', () => {
  it('offers everything when nothing is selected', () => {
    expect(availableOptions(options, [], byId)).toHaveLength(10);
  });

  it('selecting a location leaves only that location zones', () => {
    const selection = withAncestors([100], byId); // WH Arua
    const available = availableOptions(options, selection, byId).map(
      (o) => o.name,
    );

    expect(available).toContain('Arua Zone A');
    expect(available).toContain('Arua Zone B');
    // A different location under the same FOB, and its zone, are out.
    expect(available).not.toContain('WH Entebbe');
    expect(available).not.toContain('Entebbe Zone');
    // So is the whole other FOB.
    expect(available).not.toContain('Makerere FOB');
    expect(available).not.toContain('Makerere Zone');
  });

  it('selecting a zone rules out its sibling zone', () => {
    const selection = withAncestors([1000], byId); // Arua Zone A
    const available = availableOptions(options, selection, byId).map(
      (o) => o.name,
    );

    expect(available).toContain('Arua Zone A');
    expect(available).not.toContain('Arua Zone B');
  });

  it('always keeps what is already selected visible', () => {
    const selection = withAncestors([1000], byId);
    const available = availableOptions(options, selection, byId).map(
      (o) => o.id,
    );
    selection.forEach((id) => expect(available).toContain(id));
  });
});

describe('removeWithDescendants', () => {
  it('dropping a location drops its zones', () => {
    const selection = withAncestors([1000], byId); // zone + location + FOB
    const after = removeWithDescendants(100, selection, byId); // remove WH Arua
    expect(names(after)).toEqual(['Kitukutwe FOB', 'Worship Harvest Global']);
  });
});

describe('reconcileSelection', () => {
  it('adds ancestors when a zone is picked', () => {
    const result = reconcileSelection([], [1000], byId);
    expect(names(result)).toEqual([
      'Arua Zone A',
      'Kitukutwe FOB',
      'WH Arua',
      'Worship Harvest Global',
    ]);
  });

  it('removes descendants when a parent is cleared', () => {
    const previous = withAncestors([1000], byId);
    const next = previous.filter((id) => id !== 100); // user removed WH Arua
    const result = reconcileSelection(previous, next, byId);

    expect(names(result)).toEqual(['Kitukutwe FOB', 'Worship Harvest Global']);
  });

  it('is stable when nothing changes', () => {
    const previous = withAncestors([1000], byId);
    const result = reconcileSelection(previous, previous, byId);
    expect(result.sort()).toEqual([...previous].sort());
  });
});
