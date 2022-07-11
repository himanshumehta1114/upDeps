import { gt } from "semver";
import "./App.css";

const dummyPkg = `{
  "name": "updeps",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/user-event": "^13.5.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
`;

const cleanVersion = version => version.replace(/^([<>=~^]+)/, '')

const getDepTree = (pkgFile) => {
  pkgFile = JSON.parse(pkgFile);

  const depTree = {
    dependencies: null,
    devDependencies: null,
    peerDependencies: null,
  };

  if (pkgFile.dependencies) {
    depTree.dependencies = pkgFile.dependencies;
  }

  if (pkgFile.devDependencies) {
    depTree.devDependencies = pkgFile.devDependencies;
  }

  if (pkgFile.peerDependencies) {
    depTree.peerDependencies = pkgFile.peerDependencies;
  }

  return depTree;
};

const getDepMetadata = async (dep) => {
  const meta = await fetch(`https://registry.npmjs.org/${dep}`);

  return meta.json();
};

const inRange = (curr, range) => range.filter(available => gt(available, curr))

function App() {
  const fetchUpdates = async (e) => {
    e.preventDefault();
    const pkgFile = e.target[0].value;

    const { dependencies } = getDepTree(pkgFile);

    for await (let dep of Object.keys(dependencies)) {
      const { versions } = await getDepMetadata(dep);
      console.log(versions)
      console.log(dep, inRange(cleanVersion(dependencies[dep]), Object.keys(versions)))
    }
  };

  return (
    <div className="App">
      <form style={{ padding: "1rem" }} onSubmit={fetchUpdates}>
        <div>
          <textarea
            name="packagefile"
            value={dummyPkg}
            style={{ width: "50%", minHeight: "200px", padding: "1rem" }}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
