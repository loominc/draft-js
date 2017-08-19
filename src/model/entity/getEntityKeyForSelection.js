/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getEntityKeyForSelection
 * @typechecks
 * @flow
 */

'use strict';

import type ContentState from 'ContentState';
import type {EntityMap} from 'EntityMap';
import type SelectionState from 'SelectionState';
import type {DraftEntitySet} from 'DraftEntitySet';
import {NONE} from 'DraftEntitySet';

/**
 * Return the entity key that should be used when inserting text for the
 * specified target selection, only if the entity is `MUTABLE`. `IMMUTABLE`
 * and `SEGMENTED` entities should not be used for insertion behavior.
 */
function getEntityKeyForSelection(
  contentState: ContentState,
  targetSelection: SelectionState,
): DraftEntitySet {
  var entityKey;

  if (targetSelection.isCollapsed()) {
    var key = targetSelection.getAnchorKey();
    var offset = targetSelection.getAnchorOffset();
    if (offset > 0) {
      entityKey = contentState.getBlockForKey(key).getEntityAt(offset - 1);
      return filterKey(contentState.getEntityMap(), entityKey);
    }
    return null;
  }

  var startKey = targetSelection.getStartKey();
  var startOffset = targetSelection.getStartOffset();
  var startBlock = contentState.getBlockForKey(startKey);

  entityKey =
    startOffset === startBlock.getLength()
      ? null
      : startBlock.getEntityAt(startOffset);

  return filterKey(contentState.getEntityMap(), entityKey);
}

/**
 * Determine whether any entity keys correspond to a `MUTABLE` entity. If so,
 * return them. If not, return an empty set.
 */
function filterKey(
  entityMap: EntityMap,
  entityKeys: DraftEntitySet,
): DraftEntitySet {
  if (entityKeys && entityKeys.size > 0) {
    return entityKeys
      .map(key => {
        var entity = entityMap.get(key);
        return entity.getMutability() === 'MUTABLE' ? key : null;
      })
      .filter(x => x);
  }
  return NONE;
}

module.exports = getEntityKeyForSelection;
