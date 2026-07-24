import type { TechSection } from "./types";
import { Prose, Table, BulletList, NumberedList, SpecRefs } from "./helpers";

export const nrSections: TechSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <Prose>
        <p>
          5G New Radio (NR) is the radio access technology standardized from Release 15 onward, designed
          to support three broad service classes: enhanced Mobile Broadband (eMBB), Ultra-Reliable
          Low-Latency Communications (URLLC), and massive Machine-Type Communications (mMTC). NR
          introduces a flexible OFDM numerology, operation across both sub-6 GHz (FR1) and mmWave (FR2)
          spectrum, and a service-based 5G Core (5GC).
        </p>
        <p>
          NR can be deployed non-standalone (NSA), anchored by an LTE eNodeB and EPC via EN-DC, or
          standalone (SA), where the gNodeB connects directly to the 5GC. The gNodeB architecture supports
          a CU/DU functional split over the F1 interface, enabling centralized baseband processing.
        </p>
        <SpecRefs numbers={["TS 38.201", "TS 38.300"]} />
      </Prose>
    ),
  },
  {
    id: "key-features",
    title: "Key Features",
    body: (
      <BulletList
        items={[
          "Scalable OFDM numerology (15/30/60/120/240 kHz subcarrier spacing) for diverse latency/coverage needs",
          "Flexible slot structure with mini-slots for low-latency URLLC scheduling",
          "Massive MIMO and beamforming, especially critical for FR2 mmWave coverage",
          "Bandwidth Parts (BWP) enabling UE power saving and mixed-numerology operation",
          "Network slicing support end-to-end via the 5GC service-based architecture",
          "Native support for both NSA (EN-DC) and SA deployment architectures",
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
            NG-RAN consists of gNodeBs (and, in NSA, ng-eNodeBs) connected to the 5GC over NG, and to each
            other over Xn. A gNodeB may be split into a Central Unit (CU) and one or more Distributed Units
            (DU), communicating over F1.
          </p>
        </Prose>
        <Table
          headers={["Component", "Full Name", "Function"]}
          rows={[
            ["gNodeB", "Next Generation Node B", "NR radio resource management, scheduling, mobility, CU/DU split"],
            ["AMF", "Access and Mobility Management Function", "Registration, connection/mobility management, NAS termination"],
            ["SMF", "Session Management Function", "PDU session establishment, IP allocation, UPF selection"],
            ["UPF", "User Plane Function", "Packet routing/forwarding, QoS enforcement, PFCP-controlled"],
            ["UDM", "Unified Data Management", "Subscriber data and credential generation"],
            ["PCF", "Policy Control Function", "QoS and charging policy rules"],
          ]}
        />
        <SpecRefs numbers={["TS 23.501", "TS 38.401", "TS 38.300"]} />
      </div>
    ),
  },
  {
    id: "physical-layer",
    title: "Physical Layer",
    body: (
      <div className="space-y-6">
        <Table
          headers={["Parameter", "Value"]}
          rows={[
            ["Waveform", "CP-OFDM (DL and UL), DFT-s-OFDM optional for UL coverage"],
            ["Subcarrier spacing", "15, 30, 60 kHz (FR1); 60, 120, 240 kHz (FR2)"],
            ["Max channel bandwidth", "100 MHz (FR1) / 400 MHz (FR2) per component carrier"],
            ["Modulation", "QPSK, 16-QAM, 64-QAM, 256-QAM"],
            ["MIMO", "Up to 8 layers DL (single-user), massive MIMO with up to 64 antenna ports"],
            ["Channel coding", "LDPC (data channels), Polar codes (control channels)"],
          ]}
        />
        <SpecRefs numbers={["TS 38.211", "TS 38.213", "TS 38.214", "TS 38.212"]} />
      </div>
    ),
  },
  {
    id: "frequency-bands",
    title: "Frequency Bands",
    body: (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-darktext">FR1 Bands (sub-6 GHz, selected)</h3>
        <Table
          headers={["Band", "Frequency Range", "Duplex", "Region"]}
          rows={[
            ["n1", "1920–1980 / 2110–2170 MHz", "FDD", "Global (2100 MHz)"],
            ["n41", "2496–2690 MHz", "TDD", "North America / APAC"],
            ["n77", "3300–4200 MHz", "TDD", "Global (C-band)"],
            ["n78", "3300–3800 MHz", "TDD", "Global (C-band)"],
            ["n79", "4400–5000 MHz", "TDD", "China / APAC"],
          ]}
        />
        <h3 className="text-sm font-semibold text-darktext">FR2 Bands (mmWave, selected)</h3>
        <Table
          headers={["Band", "Frequency Range", "Region"]}
          rows={[
            ["n257", "26.5–29.5 GHz", "Global"],
            ["n258", "24.25–27.5 GHz", "Europe / APAC"],
            ["n260", "37–40 GHz", "North America"],
          ]}
        />
        <SpecRefs numbers={["TS 38.101-1", "TS 38.101-2", "TS 38.104"]} />
      </div>
    ),
  },
  {
    id: "ue-categories",
    title: "UE Categories",
    body: (
      <Table
        headers={["Class", "Typical Peak DL", "Typical Peak UL", "MIMO Layers"]}
        rows={[
          ["FR1 eMBB (baseline)", "~1–2.7 Gbps", "~600 Mbps", "4"],
          ["FR1 with CA", "~4+ Gbps", "~900 Mbps", "4"],
          ["FR2 mmWave", "~4.6+ Gbps", "~1.5 Gbps", "2"],
          ["RedCap (Rel-17)", "~150 Mbps", "~50 Mbps", "1–2"],
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
          "Enhanced Mobile Broadband (eMBB) — high-throughput consumer and fixed-wireless access",
          "URLLC — ultra-reliable low-latency services for industrial automation and V2X",
          "mMTC — massive machine-type communications for large-scale IoT (with NB-IoT/eMTC interworking)",
          "Network slicing — dedicated logical networks (e.g. eMBB slice vs. URLLC slice) over shared infrastructure",
          "VoNR — Voice over New Radio, IMS-based voice native to standalone 5G",
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
          ["NAS / AS ciphering", "128-NEA1/2/3 (with 256-bit extensions in later releases)", "User and signaling plane confidentiality"],
          ["NAS / AS integrity", "128-NIA1/2/3", "Signaling and user-plane integrity protection"],
          ["Authentication", "5G-AKA or EAP-AKA'", "Mutual authentication with SUCI-based subscriber identity concealment"],
          ["Key hierarchy", "K → CK/IK → KAUSF → KSEAF → KAMF → KgNB", "Layered key derivation across AUSF, SEAF, AMF, and gNodeB"],
        ]}
      />
    ),
  },
  {
    id: "procedures",
    title: "Key Procedures",
    body: (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-darktext">Registration (Attach)</h3>
        <NumberedList
          items={[
            "UE sends Registration Request (NAS) within an RRC Setup Complete message",
            "gNodeB forwards the message to the AMF as an Initial UE Message over NGAP (N2)",
            "AMF triggers authentication via the AUSF (5G-AKA), establishing NAS security",
            "AMF selects an SMF; SMF establishes a PDU session with a UPF via N4/PFCP",
            "AMF sends Initial Context Setup Request; gNodeB configures radio bearers via RRC Reconfiguration",
            "UE completes registration; a default PDU session is typically established alongside",
          ]}
        />
        <h3 className="text-sm font-semibold text-darktext">Handover (Xn-based)</h3>
        <NumberedList
          items={[
            "Source gNodeB evaluates UE measurement reports against configured events",
            "Source gNodeB sends Handover Request to the target gNodeB over XnAP",
            "Target gNodeB admits resources and returns Handover Request Acknowledge",
            "Source gNodeB commands the UE via RRC Reconfiguration",
            "UE synchronizes to the target cell and confirms with RRC Reconfiguration Complete",
            "Target gNodeB triggers a Path Switch Request to the AMF to update the N3 user-plane path",
          ]}
        />
        <h3 className="text-sm font-semibold text-darktext">Paging</h3>
        <NumberedList
          items={[
            "Downlink data or signaling arrives for a UE in RRC_IDLE or RRC_INACTIVE",
            "AMF (or the last-serving gNodeB, for RRC_INACTIVE) sends Paging",
            "gNodeBs in the relevant registration/RAN notification area broadcast Paging",
            "UE responds by initiating RRC connection establishment or resume",
          ]}
        />
        <SpecRefs numbers={["TS 23.502", "TS 38.331", "TS 38.413"]} />
      </div>
    ),
  },
  {
    id: "power-saving",
    title: "Power Saving",
    body: (
      <div className="space-y-6">
        <Table
          headers={["Mechanism", "Description", "Introduced"]}
          rows={[
            ["Connected-mode DRX", "Configurable sleep cycles while RRC_CONNECTED", "Rel-15"],
            ["RRC_INACTIVE", "Low-overhead state retaining UE context to skip full re-establishment", "Rel-15"],
            ["BWP switching", "UE falls back to a narrower/low-power bandwidth part when idle-ish", "Rel-15"],
            ["UE Power Saving (Rel-16 PS)", "Wake-up signaling and adaptive DRX ahead of paging/scheduling occasions", "Rel-16"],
          ]}
        />
        <SpecRefs numbers={["TS 38.304", "TS 38.331"]} />
      </div>
    ),
  },
  {
    id: "interworking",
    title: "Interworking",
    body: (
      <Table
        headers={["Aspect", "5G NR / 5GC", "LTE / EPC"]}
        rows={[
          ["Core network", "5GC (service-based architecture, SBA)", "EPC (point-to-point interfaces)"],
          ["Deployment options", "NSA (EN-DC via LTE anchor) or SA (direct to 5GC)", "LTE-only"],
          ["Mobility to LTE", "EN-DC add/release, or inter-RAT handover N26 (5GC↔EPC)", "n/a"],
          ["Session concept", "PDU Session", "PDN Connection / EPS Bearer"],
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
          <span key="r16"><strong>Rel-16:</strong> NR-U unlicensed spectrum, V2X sidelink, integrated access backhaul (IAB), industrial IoT (TSN).</span>,
          <span key="r17"><strong>Rel-17:</strong> RedCap (NR-Light) for mid-tier IoT, NR-NTN (satellite), multicast/broadcast, small-data transmission.</span>,
          <span key="r18"><strong>Rel-18 (5G-Advanced):</strong> AI/ML-native RAN optimization, further RedCap, XR enhancements — see the 5G-Advanced technology page.</span>,
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
          ["NR_newRAT", "Rel-15", "Foundational NR air interface and NG-RAN architecture"],
          ["NR_IAB", "Rel-16", "Integrated access and wireless backhaul"],
          ["NR_redcap", "Rel-17", "Reduced capability devices for mid-tier IoT"],
          ["NR_NTN", "Rel-17", "Non-terrestrial network (satellite) support"],
        ]}
      />
    ),
  },
  {
    id: "comparison",
    title: "Comparison with Previous Generations",
    body: (
      <Table
        headers={["Aspect", "LTE (4G)", "5G NR (Standalone)"]}
        rows={[
          ["Core network", "EPC (flat, point-to-point)", "5GC (service-based architecture)"],
          ["Peak throughput", "~300 Mbps–1 Gbps class", "Multi-Gbps class, especially FR2"],
          ["Latency (air interface)", "~10 ms round-trip class", "~1 ms class with mini-slots (URLLC)"],
          ["Spectrum", "Sub-6 GHz only", "Sub-6 GHz (FR1) and mmWave (FR2)"],
          ["Slicing", "Not natively supported", "Native end-to-end network slicing"],
        ]}
      />
    ),
  },
];
