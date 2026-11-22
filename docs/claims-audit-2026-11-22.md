# Claim audit and fission coverage — November 22, 2026

All 139 records in the original mechanically unconfirmed queue were adjudicated: **56 supported, 80 corrected, 3 removed**. This is an editorial audit of that fixed corpus, not certification of every unflagged or inaccessible source. Mechanical term matching still produces a separate triage queue, especially for newly added taxonomy labels, converted units, PDF text and dates rendered differently by their sources.

The immutable starting worklist is `data/research/claims-audit-2026-11-22-worklist.json`; the dispositions are in `data/research/claims-audit-2026-11-22.json`. Each surviving record has an exact canonical-object fingerprint, cited-source URL, archived snapshot fingerprint, and verbatim excerpts. The validator checks original-ID coverage, final-record identity, source-to-snapshot association, snapshot contents and quotes. It retains mechanical results separately from editorial review; modifying a record or its evidence expires its approval.

## Corrected measurement frames

| Frame | Current value | Meaning |
| --- | --- | --- |
| U.S. operable commercial units | 94 | EIA year-end 2025 licensed-unit stock, including outages |
| U.S. net summer nuclear capacity | 96,880 MWe | EIA year-end 2025 licensed-unit capacity |
| U.S. annual nuclear net generation | 784.781 TWh | EIA calendar 2025 output |
| Nuclear share of U.S. generation | 17.7% | EIA calendar 2025 share |
| Published capacity factor | 91.0% | EIA time-adjusted denominator; not recalculated from year-end capacity |
| Selected advanced-reactor commercial output | 0 MWe | The 18-company sample, not national output |
| Sample documented builds | 420 MWe | 345 MWe NRC construction + 75 MWe DOE pathway |
| Sample permitted | 620 MWe | Design electrical ratings; no physical-build credit |
| Sample documented actions | 2,056 MWe | Includes permits, applications and funded development, not just firm plant orders |
| Sample non-binding announcement ceilings | 37,060 MWe | Not a forecast; not added to documented actions |

The EIA publication is October 2026, with five annual observations per metric for 2021–2025. The separate March 2026 inventory's 94 operating reactors at 54 plants and 98,441 MW are explicitly a different inventory frame, including out-of-service reporting. Neither inventory count proves a restart is generating. Source CSV rows and unit conversions are checked offline.

## Material corrections

- Hermes 2's NRC permits describe two 35 MWth test reactors. The company's proposed 50 MWe configuration is not treated as matching electrical construction authorization. Its capacity row was removed; the permit remains a proof event. Google's full 500 MW non-binding ceiling is restored.
- GEV's additional 3 GW framework had unresolved overlap; it remains unquantified. Valar's 30 MW AI-factory demand is not reactor supply. Valar's unverified commercial electrical unit rating is null, not a conversion from Ward 250 thermal power. Eielson's 5 MWe is also uncredited because the accessible cited introduction does not establish that rating.
- Oklo's current NRC record is pre-application, not an active combined-license review. TerraPower's permit issuance is March 9, distinct from the preceding Commission vote. Aalo's DOE milestone is Aalo-X, not a separately named Critical Test Reactor.
- The unsupported TerraPower 2031/five-to-seven-year conflict and the unsupported $5.4B Clinch River benchmark were removed. Historical TerraPower cost remains dated to the November 2021 announcement, not a newly reaffirmed 2026 budget.
- OPG's May 2025 C$7.7B first-unit/shared-system and C$20.9B four-unit budgets include interest, escalation and contingency. The November 10, 2026 update withdraws the previous Unit 1 budget and October 2030 target; no replacement budget is invented.
- NRC FY2026 hourly fees are $154 for qualifying advanced-reactor activities and $337 otherwise under the annual rule. A Federal Register access-warning snapshot was replaced by the actual Hermes deadline PDF.
- ANPI vendor/site pairings are program selections, not firm fleet orders or operating authorization. Paywalled introductions support only visible agreement/selection facts; unsupported ownership, delivery and power-sale terms were removed. Antares/NASA electrically heated testing is not nuclear generation.
- Lazard LCOE remains modeled even when capital inputs reflect completed projects. Modeled electricity costs, actual plant spending, award ceilings, debt, equity, budgets and tariffs are kept separate.

## Coverage and source hierarchy

The new `/fission` route covers PWR/VVER, BWR, PHWR/CANDU, GCR/AGR/Magnox, LWGR/RBMK, HTGR/VHTR, sodium fast, lead fast, gas fast, liquid-fuel molten salt, solid-fuel salt-cooled FHR, supercritical water, and heat-pipe reactors. Three historical hybrid classifications and six research configurations supplement these families. Coolant, moderator, spectrum and fuel form are separate from size, generation, naval/space/floating use, fuel cycle and application. Thorium is a fuel-cycle choice, not an independent coolant family; MARVEL's NaK cooling is not heat-pipe cooling.

Recent dated examples include Vogtle 4 commercial operation, Kakrapar 3's declared commercial date, HTR-PM commercial operation, BREST first concrete, MCRE fuel production, Hermes 2 permits, eVinci's NCERC hot zero-power criticality, and 2026 U.S. construction permits. A critical experiment at NCERC does not advance a separately planned DOME project to commercial operation. IAEA's 2025 publication reports December 2024 observations.

Government/regulator and laboratory records lead: EIA, NRC, DOE, INL, the Indian Central Electricity Authority, IAEA and the Generation IV International Forum, with host-university and company disclosures where they establish the particular fact. Existing archived DOE/INL, Lazard, NIA and other cost-model reports remain the economics layer. Agency forecasts and company targets never become observed output.

No recent verified deployment milestone was established for GCR, LWGR or SCWR in the reviewed corpus; their fleet/historical or research status is explicit. No operating GFR milestone was established. Historical research references define terminology, not current counts. This is broad family coverage, not an exhaustive worldwide vendor/prototype census or classified naval inventory. Direct DAF ANPI pages were blocked, so accessible reporting retains its press basis. Those seams are recorded in the research files rather than repeatedly researched.

## Verification

`npm run data:audit` checks the 139 dispositions, 27 fleet observations, exact primary-source excerpts, family examples and historical crosswalk. Regression tests expire altered approvals and prevent thermal power, AI demand or unverified ratings becoming MWe. Standard build, rendered-page, Pages export, lint, source, generated-file and browser checks apply before the PR is marked ready. Verification results and independent-review findings are appended below when completed.

Pre-review gates: 72 tests passed; four Pages-export tests passed; source validation and audit checks passed; generated files were byte-identical across two runs. Lint has no errors (two existing warnings in the user’s untracked `_dump_nd.mts`). Browser verification at 768×1024, 1280×800 and 375×812 exercised filters/sorts, disclosure restoration, dossier navigation, family disclosures, national/sample figures and unknown electrical ratings, with no browser errors or page overflow. The new source links were adjusted to 44px targets after the first mobile pass.
