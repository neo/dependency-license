const getPackageJson = require('package-json');

let unknown = 0

async function getDependencyLicense(json, dev, depth = true) {
  let result = {};
  const dependencies = Object.assign({}, dev ? json.devDependencies : {}, json.dependencies);
  await Promise.all(Object.keys(dependencies).map(async name => {
    if (dependencies[name].includes('/')) {
      console.warn(++unknown, name, dependencies[name]);
      result[`${name}@${dependencies[name]}`] = { license: 'unknown' };
    } else {
      const package = await getPackageJson(name, { version: dependencies[name], fullMetadata: true });
      result[`${name}@${dependencies[name]}`] = { license: package.license };
      if (depth === true || depth > 0) {
        const next = depth === true ? true : depth - 1;
        result[`${name}@${dependencies[name]}`].dependencies = await getDependencyLicense(package, dev, next);
      }
    }
    return;
  }));
  return result;
}

module.exports = getDependencyLicense;
