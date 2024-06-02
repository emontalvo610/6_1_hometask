export const isObjectEmpty = (obj: object) => {
  const keys = Object.keys(obj);
  return keys.length === 1 && keys[0] === "file";
};

export const generateTree = (filePaths) => {
  const tree = {};

  filePaths.forEach(filePath => {
    const pathParts = filePath.path.split('/');
    let currentNode = tree;

    pathParts.forEach((part, index) => {
      if (!currentNode[part]) {
        currentNode[part] = index === pathParts.length - 1 ? {file: filePath} : {};
      }
      currentNode = currentNode[part];
    });
  });

  // Sorting the keys (folders first, sorted alphabetically)
  const sortKeys = (node) => {
    const keys = Object.keys(node);
    keys.sort((a, b) => {
      if (!isObjectEmpty(node[a]) && isObjectEmpty(node[b])) {
        return -1; // Folder before file
      } else if (isObjectEmpty(node[a]) && !isObjectEmpty(node[b])) {
        return 1; // File after folder
      } else {
        return a.localeCompare(b, undefined, { sensitivity: 'base' }); // Sort alphabetically ignoring case
      }
    });

    return keys;
  };

  // Recursively sort the tree structure
  const sortTree = (node) => {
    const sortedKeys = sortKeys(node);
    sortedKeys.forEach(key => {
      if (!isObjectEmpty(node[key])) {
        node[key] = sortTree(node[key]);
      }
    });

    return sortedKeys.reduce((sortedNode, key) => {
      sortedNode[key] = node[key];
      return sortedNode;
    }, {});
  };

  return sortTree(tree);
};