# Citation

Use these formats when referencing Embedded32 in academic work, syllabi, and lab assignments.

A **Zenodo DOI is not yet available**. When the maintainer archives the first GitHub Release on Zenodo, this page and `CITATION.cff` will be updated with real DOIs. Do not cite a fabricated DOI.

## Software citation (recommended)

> Tripathi, M. M. (2026). _Embedded32: Open-source TypeScript platform for CAN, J1939, and ECU simulation education_ (Version 1.0.0) [Computer software]. https://github.com/Mukesh-SCS/Embedded32

Documentation site (after GitHub Pages deploy): https://mukesh-scs.github.io/Embedded32/

## BibTeX

```bibtex
@software{embedded32_2026,
  author       = {Tripathi, Mukesh Mani},
  title        = {Embedded32: Open-source TypeScript platform for CAN, J1939, and ECU simulation education},
  year         = {2026},
  version      = {1.0.0},
  url          = {https://github.com/Mukesh-SCS/Embedded32},
  license      = {MIT},
  note         = {DOI pending first Zenodo archive; cite version tag or commit for reproducibility}
}
```

After Zenodo issues a DOI, add:

```bibtex
  doi          = {10.5281/zenodo.XXXXXXX},
```

and remove the `note` field.

## Citing a specific version (reproducibility)

Until a version DOI exists, cite the **Git tag and commit**:

> Tripathi, M. M. (2026). Embedded32 v1.0.0, commit `<full-sha>`, https://github.com/Mukesh-SCS/Embedded32/tree/v1.0.0

Students and researchers should record the commit hash they used (`git rev-parse HEAD`) in lab reports.

## Citing classroom labs

Four labs ship under `labs/` with starter code, rubrics, and verified solutions. Example:

> Tripathi, M. M. (2026). Embedded32 Lab 02: J1939 messaging, in _Embedded32_ (Version 1.0.0), `labs/lab-02-j1939-messaging/`, https://github.com/Mukesh-SCS/Embedded32

| Lab | Suggested short name |
|-----|----------------------|
| Lab 1 | CAN communication basics — `labs/lab-01-can-basics/` |
| Lab 2 | J1939 messaging — `labs/lab-02-j1939-messaging/` |
| Lab 3 | Multi-ECU simulation — `labs/lab-03-multi-ecu-simulation/` |
| Lab 4 | Diagnostics and faults — `labs/lab-04-diagnostics-and-faults/` |

## Citing the browser demo or traces

| Asset | Citation hint |
|-------|----------------|
| Browser demo | Embedded32 interactive demo, `apps/demo/`, served at `/demo` on the docs site |
| Synthetic traces | `examples/traces/*.json`, format `embedded32-trace-v1`, `"source": "synthetic"` |

Example:

> Embedded32 synthetic trace `normal-operation.json`, Embedded32 repository v1.0.0, `examples/traces/`

## DOI status

| Item | Status |
|------|--------|
| Zenodo GitHub integration | **Not configured** (owner action) |
| Concept DOI (all versions) | **Not issued** |
| Version DOI for v1.0.0 | **Not issued** |
| `CITATION.cff` `identifiers.doi` | **Absent** until real DOI exists |

Maintainers: [maintainers/zenodo-release.md](./maintainers/zenodo-release.md)

## Machine-readable metadata

GitHub and citation tools read [CITATION.cff](../CITATION.cff) at the repository root. Validate locally:

```bash
npm run test:citation
```

## Related

- [Root README — Citation](../README.md#citation)
- [Course module](./education/course-module.md)
- [Instructor guide](./education/instructor-guide.md)
