# Application catalogue attribution and scope / 應用目錄來源與範圍

Frozen catalogue: **2,338** unique software repositories, comprising 1,121 applications, 382 developer tools and 835 libraries. This is not a ranking and does not represent installed integrations.

授權證據分為 **1,120** 個已擷取根目錄授權檔與 **1,218** 個策展目錄授權聲明；逐庫授權檔自動辨識不等於全專案法律稽核。另有 2,335 個授權待確認候選，不列入開源目錄數；3 個含限制性條款的專案已排除。

## Sources and retained notices / 來源與保留聲明

- **awesome-selfhosted/awesome-selfhosted-data**, awesome-selfhosted contributors — CC-BY-SA-3.0. Pinned commit `8cf2209828f0ee185109a98808010534bd78517e`; [source](https://github.com/awesome-selfhosted/awesome-selfhosted-data/tree/8cf2209828f0ee185109a98808010534bd78517e); retained license: `sources/selfhosted/LICENSE`. 1,121 final records have attribution to this catalogue (memberships overlap).
- **awesome-foss/awesome-sysadmin**, awesome-foss / awesome-sysadmin contributors — CC-BY-SA-4.0. Pinned commit `86787ee02eee8a25a3f2da179499b39ce47a8973`; [source](https://github.com/awesome-foss/awesome-sysadmin/tree/86787ee02eee8a25a3f2da179499b39ce47a8973); retained license: `sources/sysadmin/LICENSE.txt`. 220 final records have attribution to this catalogue (memberships overlap).
- **vinta/awesome-python**, Vinta Chen and awesome-python contributors — CC-BY-4.0. Pinned commit `3e8c86bac6ad0548b36921ba219a56592982e046`; [source](https://github.com/vinta/awesome-python/tree/3e8c86bac6ad0548b36921ba219a56592982e046); retained license: `sources/python/LICENSE`. 379 final records have attribution to this catalogue (memberships overlap).
- **avelino/awesome-go**, Avelino and awesome-go contributors — MIT. Pinned commit `9084f305adfe8a9677a706cbac851a7b1af5fe77`; [source](https://github.com/avelino/awesome-go/tree/9084f305adfe8a9677a706cbac851a7b1af5fe77); retained license: `sources/go/LICENSE`. 674 final records have attribution to this catalogue (memberships overlap).

The original upstream descriptions and their authors retain the source licences above. The derived combined catalogue metadata, classification and attribution layout are offered under **CC BY-SA 4.0**, subject to the retained upstream notices and share-alike requirements. The separately fetched software projects, code, weights, assets and dependencies retain their own licences; this notice does not relicense them. The MIT notice from awesome-go and original CC notices are included unchanged in `sources/`. Selfhosted contributor credits are retained in `sources/selfhosted/AUTHORS`.

Changes made: Markdown links and whitespace were normalized; canonical repository URLs were deduplicated; source headings were mapped to 12 categories; explicit forks, resource lists, books, unsupported repository URLs and declared restricted licences were filtered; repository root licence text was fetched where available, hashed and classified automatically. Each entry retains its original catalogue URL, commit, source path/line, description hash, original declared licences and independent inspection record. Multi-license identifiers from a directory do not establish a verified AND/OR selection or coverage of every file.

新增變更包括格式正規化、相同儲存庫去重、12 類映射與授權證據整理。英文簡介保留來源語義；中文學習導讀由另一份 overlay 提供，標註其依據與範圍，不能冒充逐篇逐庫文件全文翻譯。來源目錄的多個授權識別碼不代表已驗證雙授權選項。

## Capability and verification boundaries / 能力與查核範圍

- All source-catalogue entries begin with `capabilityMode: source`, `runtimeVerified: false`, `documentationRead: false`, and `webDemoVerified: false`. The academy may separately merge its actually implemented adapters by exact repository identity.
- An official homepage is not automatically an online service; `demoUrl` is populated only when the upstream directory explicitly labels a demo. No demo execution or availability is promised.
- Repository LICENSE URLs use the retrieved default-branch HEAD. SHA-256 hashes preserve observed bytes, but `repositoryRevision: null` explicitly records that these are not pinned repository commits. The four source directories are pinned independently.
- Known restricted/source-available licences were excluded. Unknown licence evidence was quarantined. Initial network failures were transport/DNS failures, not proof that a licence is absent.
- Link validation covers URL syntax and retrieved source/licence evidence. It is not an exhaustive live validation of every homepage, docs site, demo, installation command or supported operating system.
- Titles and public video descriptions identify source mentions; they do not establish that all spoken/video content was transcribed. Channel and video evidence is kept separately under `reference_audit/video/`.

## Reproduction / 重現

1. `fetch_sources.py` retrieves and records pinned directory snapshots.
2. `build_catalog.py` parses, filters and deduplicates the source candidates.
3. `verify_licenses.py` and `retry_licenses.py` retrieve licence evidence; the retry uses eight persistent HTTP sessions. No repository code is executed.
4. `finalize_catalog.py` applies SPDX eligibility, separates unknown/restricted records and writes the frozen catalogue.
5. `catalog_enrichment/audit_catalog.py` checks IDs, links, licence evidence hashes, source-only capability claims and bilingual overlay coverage.

A fresh run may observe newer upstream licence text; keep this frozen evidence when reproducing these counts.
