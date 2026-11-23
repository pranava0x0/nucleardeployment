# PR 16 final review

The user requested data quality/completeness, nuclear technical accuracy, fewer interactions, plain writing, then merge and branch cleanup. Independent reviewers checked data and nuclear facts; the main session checked the rendered UI and writing.

## Confirmed accuracy findings, corrected

| Finding | Correction |
| --- | --- |
| Eielson's unsupported 5 MW, 30-year and fixed-price terms survived in financing examples and sector advice. | Keep the notice of intent and prospective supplier; remove unverified capacity, duration, price and ownership terms across those views. |
| NASA's buyer note still described reactor ownership and power sales. | Describe Antares' non-nuclear, electrically heated hardware testing. |
| The NASA/Antares position kept a December date from its previous source. | Use the replacement company's November 19 report date; do not invent the testing completion date. |
| Methodology still called Oklo's current NRC licensing track an active review. | Reconcile the methodology with NRC pre-application status and distinguish it from DOE progress. |
| DOE authorization was described as confined to DOE-owned sites. | Include qualifying non-federal sites and the DOE determination for the state-operated Utah facility. |
| A NuScale proof event still claimed exclusive SMR design approval. | State the 77 MWe standard design approval without exclusivity; distinguish it from a site operating license. |
| The Vogtle overrun note still called modeled $169/MWh an actual. | Describe modeled LCOE using completed-project capital-cost inputs. |
| The financing explanation called a master framework a committed fleet. | Distinguish a master development framework from individual plant power contracts. |

The official Antares post also now carries a company-reported label, based on verified authorship of that exact archived URL. Other LinkedIn posts retain the conservative press default.

The data review did not establish another denominator, conversion, duplicate-capacity or original-139 coverage defect. The technical review did not establish another concrete error in the 13-family taxonomy or thermal/electrical separation. The existing family-coverage gaps remain explicit; this review is not a worldwide facility census. Exact source excerpts and original audit IDs remain intact; affected canonical fingerprints were refreshed after review.

## Interaction findings, corrected

| Task | Before | After |
| --- | --- | --- |
| Read all 18 ranked companies | 6 visible; expansion needed for 12 | All 18 visible; zero expansion clicks |
| Read 13 family definitions | 13 closed disclosures | All definitions open; direct family links; optional collapse |
| Compare cost categories and company finance | Category expansion required | Comparisons open by default |
| Read annual generation/capacity factor on a phone | 720px table in a 333px viewport | Vertically labeled annual observations; no sideways scroll |
| Follow a link to a closed section | Could require a second expansion | Hash navigation reveals the target and its disclosure ancestors in one action, including repeat links |

Filters and sorting retain their behavior with the flat board, including no-match feedback and reset after dossier navigation. The family and fleet views use the existing palette, visible focus and 44px touch targets. Desktop and mobile fleet renderings share metric definitions and formatting.

## Writing review

Removed inflated certainty and metaphors about bankable exports, funding stacks, buying board seats, deadlines guaranteeing factory discipline, and fuel logistics disappearing. Replaced them with specific requirements and labeled assessments. Shortened empty states and methodology explanations. Source links identify the document rather than repeating an ambiguous publisher name. Exact archival quotations are unchanged.

## Verification

The review adds public-view regression checks for the licensing, procurement, NASA-date and modeled-cost corrections. Standard gates cover the 139 audit dispositions, EIA source-row binding, primary-source quotes, generated artifacts, source tiers, prose and both build paths. Browser checks at 768×1024, 1280×800 and 375×812 exercise all-company visibility, filters/sorts, family jumps, mobile annual observations, company navigation, section opening and repeat hash links. The merge remains gated on the final CI result; Pages and production checks follow merge.

Local gates pass: 75 tests, four Pages tests, the 139-claim/fleet audit, source/prose validation and generated-file idempotency. Lint has no errors; the two warnings are in the user’s pre-existing untracked dump file. Browser checks report no errors or page overflow, all 18 companies and 13 family definitions visible, mobile annual values readable, and section/repeat-hash targets revealed.

Both independent reviewers confirmed their findings resolved in the committed follow-up scope. The data reviewer also checked the exact-URL company provenance boundary and the targeted public-view regressions. The nuclear reviewer confirmed that related sector advice no longer confuses DOE authority with ownership of the site.
