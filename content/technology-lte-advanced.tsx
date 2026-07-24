import type { TechSection } from "./types";
import { Prose, Table, BulletList, NumberedList, SpecRefs } from "./helpers";

export const lteAdvancedSections: TechSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <Prose>
        <p>
          LTE-Advanced (LTE-A) is the Release 10 evolution of LTE, the first 3GPP release to formally meet
          the ITU's IMT-Advanced requirements for a true "4G" system. It preserves backward compatibility
          with Release 8/9 LTE while adding carrier aggregation, higher-order MIMO, relay nodes, and
          coordinated multi-point transmission to substantially raise peak and cell-edge throughput.
        </p>
        <p>
          A Release 8 UE can operate on an LTE-Advanced carrier without seeing the enhancements, while an
          LTE-A capable UE can exploit aggregated carriers and advanced antenna schemes for significantly
          higher data rates.
        </p>
        <SpecRefs numbers={["TS 36.300", "TS 36.101"]} />
      </Prose>
    ),
  },
  {
    id: "key-features",
    title: "Key Features",
    body: (
      <BulletList
        items={[
          "Carrier Aggregation (CA) — combining up to 5 component carriers (Rel-10) for up to 100 MHz aggregated bandwidth",
          "Enhanced MIMO — up to 8x8 downlink and 4x4 uplink spatial multiplexing",
          "Relay nodes — layer-3 relays extending eNodeB coverage via a wireless backhaul (Un interface)",
          "Coordinated Multi-Point (CoMP) — joint transmission/reception across cells to improve cell-edge performance",
          "Heterogeneous networks (HetNet) support with enhanced Inter-Cell Interference Coordination (eICIC)",
        ]}
      />
    ),
  },
  {
    id: "architecture",
    title: "Network Architecture",
    body: (
      <div className="space-y-6">
        <Prose>
          <p>
            LTE-Advanced reuses the flat E-UTRAN/EPC architecture from Release 8, adding new logical
            elements for relaying and small-cell coordination without changing the core network model.
          </p>
        </Prose>
        <Table
          headers={["Component", "Full Name", "Function"]}
          rows={[
            ["Donor eNodeB (DeNB)", "Donor eNodeB", "Provides wireless backhaul (Un interface) to relay nodes"],
            ["Relay Node (RN)", "Relay Node", "Extends coverage; appears as a normal eNodeB to UEs on the access side"],
            ["MME / S-GW / P-GW", "EPC core elements", "Unchanged from Release 8 EPC — see the LTE technology page"],
          ]}
        />
        <SpecRefs numbers={["TS 36.300", "TS 36.216"]} />
      </div>
    ),
  },
  {
    id: "physical-layer",
    title: "Physical Layer",
    body: (
      <div className="space-y-6">
        <Table
          headers={["Parameter", "Rel-8 LTE", "LTE-Advanced (Rel-10+)"]}
          rows={[
            ["Max bandwidth (single carrier)", "20 MHz", "20 MHz per component carrier"],
            ["Max aggregated bandwidth", "n/a", "Up to 100 MHz (5 x 20 MHz CCs, Rel-10)"],
            ["Downlink MIMO", "Up to 4x4", "Up to 8x8"],
            ["Uplink MIMO", "1x2 (SIMO typical)", "Up to 4x4 SU-MIMO"],
            ["Modulation", "Up to 64-QAM", "Up to 256-QAM downlink (from Rel-12)"],
          ]}
        />
        <SpecRefs numbers={["TS 36.211", "TS 36.213"]} />
      </div>
    ),
  },
  {
    id: "frequency-bands",
    title: "Frequency Bands",
    body: (
      <div className="space-y-6">
        <Prose>
          <p>
            LTE-Advanced uses the same band plan as LTE (see the LTE technology page), with carrier
            aggregation defined via specific CA band combinations (e.g. CA_1A-3A, CA_3A-7A) standardized
            incrementally each release as operators deploy multi-band spectrum.
          </p>
        </Prose>
        <Table
          headers={["CA Combination", "Bands", "Typical Aggregated BW"]}
          rows={[
            ["CA_1-3", "B1 + B3", "Up to 40 MHz"],
            ["CA_3-7", "B3 + B7", "Up to 40 MHz"],
            ["CA_3-7-20", "B3 + B7 + B20", "Up to 55 MHz (3CC)"],
          ]}
        />
        <SpecRefs numbers={["TS 36.101"]} />
      </div>
    ),
  },
  {
    id: "ue-categories",
    title: "UE Categories",
    body: (
      <Table
        headers={["Category", "DL Peak Rate", "UL Peak Rate", "Aggregated CCs"]}
        rows={[
          ["Cat 6", "301.5 Mbps", "51 Mbps", "2"],
          ["Cat 9", "452.2 Mbps", "51 Mbps", "3"],
          ["Cat 11", "600.8 Mbps", "51 Mbps", "3–4"],
          ["Cat 16", "979 Mbps", "150 Mbps", "4+"],
        ]}
      />
    ),
  },
  {
    id: "services",
    title: "Services",
    body: (
      <BulletList
        items={[
          "High-throughput mobile broadband exploiting aggregated spectrum",
          "VoLTE, inherited unchanged from the underlying LTE/IMS service layer",
          "Improved cell-edge and indoor coverage via relay nodes and CoMP",
          "eMBMS broadcast services, extended with higher-capacity carriers",
        ]}
      />
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <Table
        headers={["Layer", "Algorithm Family", "Purpose"]}
        rows={[
          ["NAS / AS ciphering", "128-EEA1/2/3 (unchanged from LTE)", "Confidentiality protection"],
          ["NAS / AS integrity", "128-EIA1/2/3", "Integrity protection"],
          ["Relay backhaul (Un)", "AS security reused, PDCP-layer protection", "Secures the wireless donor–relay backhaul link"],
        ]}
      />
    ),
  },
  {
    id: "procedures",
    title: "Key Procedures",
    body: (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-darktext">Secondary Cell (SCell) Addition for CA</h3>
        <NumberedList
          items={[
            "UE reports channel measurements on candidate carriers to the serving (PCell) eNodeB",
            "eNodeB configures one or more SCells via RRC Reconfiguration (CA configuration)",
            "eNodeB activates the SCell via a MAC Control Element when data demand requires it",
            "UE begins scheduling on both PCell and active SCell(s), aggregating throughput",
          ]}
        />
        <h3 className="text-sm font-semibold text-darktext">Relay Node Attach</h3>
        <NumberedList
          items={[
            "RN performs an initial attach to the Donor eNodeB as a Release 10 UE to obtain backhaul connectivity",
            "RN retrieves its RN-specific configuration from the network (OAM)",
            "RN establishes the Un interface and starts operating as an eNodeB toward access-side UEs",
          ]}
        />
        <SpecRefs numbers={["TS 36.331", "TS 36.300"]} />
      </div>
    ),
  },
  {
    id: "power-saving",
    title: "Power Saving",
    body: (
      <Table
        headers={["Mechanism", "Description"]}
        rows={[
          ["SCell DRX alignment", "Secondary cells follow the PCell DRX cycle to avoid extra UE wake-ups"],
          ["SCell deactivation timer", "Inactive SCells are deactivated automatically to save UE power"],
        ]}
      />
    ),
  },
  {
    id: "interworking",
    title: "Interworking",
    body: (
      <Table
        headers={["Aspect", "LTE (Rel-8)", "LTE-Advanced (Rel-10+)"]}
        rows={[
          ["Backward compatibility", "n/a", "Rel-8 UEs can camp on an LTE-A carrier using only the PCell"],
          ["Core network impact", "EPC baseline", "None — CA/CoMP/relay are RAN-only enhancements"],
        ]}
      />
    ),
  },
  {
    id: "extensions",
    title: "Extensions for Later Releases",
    body: (
      <BulletList
        items={[
          <span key="r11"><strong>Rel-11:</strong> CoMP standardization, enhanced PDCCH (EPDCCH) for HetNet interference mitigation.</span>,
          <span key="r12"><strong>Rel-12:</strong> Dual connectivity (small-cell/macro), 256-QAM downlink, D2D/ProSe.</span>,
          <span key="r13"><strong>Rel-13:</strong> Evolves into LTE-Advanced Pro with up to 32 aggregated carriers, NB-IoT, LAA.</span>,
        ]}
      />
    ),
  },
  {
    id: "related-work",
    title: "Related Work Items",
    body: (
      <Table
        headers={["Work Item", "Release", "Scope"]}
        rows={[
          ["LTE_CA-Core", "Rel-10", "Carrier aggregation core specification"],
          ["LTE_Relay-Core", "Rel-10", "Relay node architecture and Un interface"],
          ["LTE_eICIC_CoMP-Core", "Rel-11", "CoMP and enhanced ICIC"],
        ]}
      />
    ),
  },
  {
    id: "comparison",
    title: "Comparison with Previous Generations",
    body: (
      <Table
        headers={["Aspect", "LTE (Rel-8/9)", "LTE-Advanced (Rel-10+)"]}
        rows={[
          ["Peak DL throughput", "~300 Mbps (2x2, 20 MHz)", "~1 Gbps class (CA + 8x8 MIMO)"],
          ["IMT-Advanced compliant", "No", "Yes"],
          ["Coverage extension", "Macro cells only", "Relay nodes + HetNet/eICIC"],
        ]}
      />
    ),
  },
];
