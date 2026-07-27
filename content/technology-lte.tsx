import type { TechSection } from "./types";
import { Prose, Table, BulletList, NumberedList, SpecRefs } from "./helpers";

export const lteSections: TechSection[] = [
  {
    id: "overview",
    title: "Overview",
    body: (
      <Prose>
        <p>
          Long Term Evolution (LTE) is 3GPP's fourth-generation radio access technology, standardized
          starting in Release 8. It introduced OFDMA in the downlink and SC-FDMA in the uplink, and
          flattened the radio access network into a single element, the eNodeB, connected directly to an
          all-IP core network (the Evolved Packet Core).
        </p>
        <p>
          LTE was designed for packet-switched data from the outset, with voice delivered natively over
          IP via VoLTE from Release 9 onward. It remains a major global radio access technology and
          continues to anchor many non-standalone 5G deployments (EN-DC).
        </p>
        <SpecRefs numbers={["TS 36.201", "TS 36.300"]} />
      </Prose>
    ),
  },
  {
    id: "key-features",
    title: "Key Features",
    body: (
      <BulletList
        items={[
          "OFDMA downlink / SC-FDMA uplink air interface with scalable 1.4–20 MHz channel bandwidths",
          "Flat, all-IP network architecture: eNodeB connects directly to the EPC over S1",
          "Peak theoretical rates of 300 Mbps downlink / 75 Mbps uplink (2x2 MIMO, 20 MHz, Rel-8)",
          "Sub-frame-based scheduling with 1 ms TTI for low-latency link adaptation",
          "Support for FDD and TDD duplexing within a single core specification set",
          "Self-organizing network (SON) capabilities for automated configuration and optimization",
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
            E-UTRAN consists solely of eNodeBs, which handle all radio-related functions and connect to
            neighboring eNodeBs over X2 and to the Evolved Packet Core over S1.
          </p>
        </Prose>
        <Table
          headers={["Component", "Full Name", "Function"]}
          rows={[
            ["eNodeB", "Evolved Node B", "Radio resource management, scheduling, mobility control, header compression, ciphering"],
            ["MME", "Mobility Management Entity", "NAS signaling, idle-mode tracking, bearer management, authentication"],
            ["S-GW", "Serving Gateway", "Local mobility anchor, packet routing/forwarding, lawful interception"],
            ["P-GW", "PDN Gateway", "UE IP address allocation, packet filtering, policy enforcement, external PDN anchor"],
            ["HSS", "Home Subscriber Server", "Master subscriber database for authentication and subscription profiles"],
            ["PCRF", "Policy and Charging Rules Function", "Dynamic policy and charging control decisions"],
          ]}
        />
        <SpecRefs numbers={["TS 23.401", "TS 23.402", "TS 36.300"]} />
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
            ["Downlink multiple access", "OFDMA"],
            ["Uplink multiple access", "SC-FDMA"],
            ["Subcarrier spacing", "15 kHz"],
            ["Slot / subframe / frame", "0.5 ms slot, 1 ms subframe, 10 ms frame"],
            ["Channel bandwidths", "1.4, 3, 5, 10, 15, 20 MHz"],
            ["Modulation", "QPSK, 16-QAM, 64-QAM (256-QAM from Rel-12 for downlink)"],
            ["MIMO", "Up to 4x4 (8x8 in later releases) with codebook-based precoding"],
          ]}
        />
        <SpecRefs numbers={["TS 36.211", "TS 36.213", "TS 36.212"]} />
      </div>
    ),
  },
  {
    id: "frequency-bands",
    title: "Frequency Bands",
    body: (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-darktext">FDD Bands (selected)</h3>
        <Table
          headers={["Band", "Uplink (MHz)", "Downlink (MHz)", "Region"]}
          rows={[
            ["B1", "1920–1980", "2110–2170", "Global (2100 MHz)"],
            ["B3", "1710–1785", "1805–1880", "Europe / APAC (1800 MHz)"],
            ["B5", "824–849", "869–894", "Americas (850 MHz)"],
            ["B7", "2500–2570", "2620–2690", "Europe / APAC (2600 MHz)"],
            ["B13", "777–787", "746–756", "North America (700 MHz)"],
            ["B20", "832–862", "791–821", "Europe (800 MHz digital dividend)"],
          ]}
        />
        <h3 className="text-sm font-semibold text-darktext">TDD Bands (selected)</h3>
        <Table
          headers={["Band", "Frequency (MHz)", "Region"]}
          rows={[
            ["B38", "2570–2620", "Global"],
            ["B40", "2300–2400", "APAC"],
            ["B41", "2496–2690", "North America"],
            ["B42", "3400–3600", "Global (also 5G n78 overlap)"],
          ]}
        />
        <SpecRefs numbers={["TS 36.101", "TS 36.104"]} />
      </div>
    ),
  },
  {
    id: "ue-categories",
    title: "UE Categories",
    body: (
      <Table
        headers={["Category", "DL Peak Rate", "UL Peak Rate", "MIMO Layers"]}
        rows={[
          ["Cat 1", "10.3 Mbps", "5.2 Mbps", "1"],
          ["Cat 3", "102 Mbps", "51 Mbps", "2"],
          ["Cat 4", "150.8 Mbps", "51 Mbps", "2"],
          ["Cat 6", "301.5 Mbps", "51 Mbps", "2–4 (with CA)"],
          ["Cat 9", "452.2 Mbps", "51 Mbps", "2–4 (with CA)"],
          ["Cat M1 (eMTC)", "1 Mbps", "1 Mbps", "1"],
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
          "Mobile broadband data over default and dedicated EPS bearers with QCI-based QoS",
          "VoLTE — voice delivered as IMS-anchored VoIP over a dedicated GBR bearer",
          "SMS over IP (SGs or IMS)",
          "eMBMS — evolved Multimedia Broadcast Multicast Service for broadcast video/data",
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
          ["NAS / AS ciphering", "EEA0, 128-EEA1 (SNOW 3G), 128-EEA2 (AES), 128-EEA3 (ZUC)", "User and signaling plane confidentiality"],
          ["NAS / AS integrity", "EIA1, EIA2, EIA3", "Signaling message integrity protection"],
          ["Authentication", "EPS-AKA", "Mutual authentication between UE and network using USIM credentials"],
          ["Key hierarchy", "K → CK/IK → KASME → KeNB", "Layered key derivation isolating radio keys from core keys"],
        ]}
      />
    ),
  },
  {
    id: "procedures",
    title: "Key Procedures",
    body: (
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-darktext">Attach</h3>
        <NumberedList
          items={[
            "UE sends Attach Request (NAS) piggybacked on RRC Connection Setup Complete",
            "eNodeB forwards Initial UE Message to MME over S1AP",
            "MME authenticates the UE (EPS-AKA) and establishes NAS security",
            "MME creates a default EPS bearer via Create Session Request/Response with the S-GW/P-GW",
            "MME sends Initial Context Setup Request; eNodeB configures the radio bearer via RRC Reconfiguration",
            "UE completes Attach with Attach Complete, now in EMM-REGISTERED / ECM-CONNECTED state",
          ]}
        />
        <h3 className="text-sm font-semibold text-darktext">Handover (X2-based)</h3>
        <NumberedList
          items={[
            "Source eNodeB triggers handover based on UE measurement reports (A3 event)",
            "Source eNodeB sends Handover Request to target eNodeB over X2AP",
            "Target eNodeB admits resources and returns Handover Request Acknowledge",
            "Source eNodeB commands the UE via RRC Reconfiguration with mobilityControlInfo",
            "UE synchronizes to the target cell and sends RRC Reconfiguration Complete",
            "Target eNodeB signals Path Switch Request to the MME to update the S1-U path",
          ]}
        />
        <h3 className="text-sm font-semibold text-darktext">Paging</h3>
        <NumberedList
          items={[
            "Downlink data or NAS signaling arrives for an idle UE",
            "MME sends Paging over S1AP to all eNodeBs in the UE's tracking area",
            "eNodeBs broadcast a Paging message referencing the UE's S-TMSI",
            "UE initiates RRC Connection Establishment (Service Request) in response",
          ]}
        />
        <SpecRefs numbers={["TS 23.401", "TS 36.331", "TS 36.413"]} />
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
            ["DRX (Connected)", "UE sleeps between scheduled monitoring occasions while RRC_CONNECTED", "Rel-8"],
            ["DRX (Idle)", "UE monitors paging occasions on a configurable cycle while idle", "Rel-8"],
            ["PSM", "Power Saving Mode — UE deregisters from the radio but stays registered with the core between activity bursts", "Rel-12"],
            ["eDRX", "Extended DRX cycles up to ~43 minutes for infrequent, delay-tolerant traffic", "Rel-13"],
          ]}
        />
        <SpecRefs numbers={["TS 36.304", "TS 23.682"]} />
      </div>
    ),
  },
  {
    id: "interworking",
    title: "Interworking",
    body: (
      <Table
        headers={["Aspect", "LTE / EPC", "5G NR / 5GC"]}
        rows={[
          ["Core network", "Evolved Packet Core (flat, all-IP)", "Service-based 5G Core"],
          ["Handover interface", "S1 / X2", "N2 / Xn (or N26 for EPC interworking)"],
          ["Voice", "VoLTE (IMS)", "VoNR (IMS) or EPS fallback"],
          ["Mobility procedure", "Tracking Area Update (TAU)", "Registration / mobility registration update"],
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
          <span key="r9"><strong>Rel-9:</strong> Dual-layer beamforming, eMBMS, SON self-healing enhancements.</span>,
          <span key="r10"><strong>Rel-10 (LTE-Advanced):</strong> Carrier aggregation, relay nodes, enhanced MIMO — see the LTE-Advanced technology page.</span>,
          <span key="r12"><strong>Rel-12:</strong> Dual connectivity, D2D/ProSe, PSM for IoT power savings.</span>,
          <span key="r13"><strong>Rel-13 (LTE-Advanced Pro):</strong> NB-IoT, LAA, massive MIMO groundwork.</span>,
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
          ["LTE_eMBMS", "Rel-9", "Enhanced multimedia broadcast/multicast service"],
          ["Diff_TA_Report", "Rel-9", "Differential timing advance reporting for positioning"],
          ["SON_enh1", "Rel-9/10", "Self-organizing network enhancements"],
          ["LTE_CA-Core", "Rel-10", "Carrier aggregation core specification work"],
        ]}
      />
    ),
  },
];
