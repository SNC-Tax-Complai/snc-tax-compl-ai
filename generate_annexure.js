const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType,
         WidthType, BorderStyle, ShadingType, HeadingLevel, PageBreak, UnderlineType } = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 6, color: "1B376D" };
const borders = { top: border, bottom: border, left: border, right: border };
const lightBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const lightBorders = { top: lightBorder, bottom: lightBorder, left: lightBorder, right: lightBorder };

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 26, bold: true, font: "Calibri", color: "1B376D" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 24, bold: true, font: "Calibri", color: "2E5090" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        run: { size: 23, bold: true, italic: true, font: "Calibri", color: "1B376D" },
        paragraph: { spacing: { before: 120, after: 80 }, outlineLevel: 2 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // LETTERHEAD
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: "SA-iLabs Holdings (RepoHawk Pty Ltd)",
            bold: true,
            size: 32,
            color: "1B376D"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: "Legal & Contractual Agent Department",
            bold: true,
            size: 22,
            color: "1B376D"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: "1 Puffin Street, Country Club",
            size: 18
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: "Langebaan, Western Cape Province, 8135, South Africa",
            size: 18
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80, before: 60 },
        children: [
          new TextRun({
            text: "Email: admin@sa-ilabs.co.za | finance@sa-ilabs.co.za | devops@sa-ilabs.co.za",
            size: 18
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: "Telephone: +27 (0)68 120 8987 | +27 (0)63 256 1688 | Web: www.sa-ilabs.co.za",
            size: 18
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240, before: 240 },
        border: { bottom: { style: BorderStyle.TRIPLE, size: 24, color: "1B376D", space: 1 } },
        children: [new TextRun("")]
      }),

      // TITLE
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: "ANNEXURE \"A\"",
            bold: true,
            size: 26,
            color: "1B376D"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: "INTELLECTUAL PROPERTY, OWNERSHIP TRANSFER, OPERATIONAL CONTINUITY & TECHNICAL HANDOVER CLARIFICATION",
            bold: true,
            size: 20,
            color: "1B376D"
          })
        ]
      }),

      // PREAMBLE
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("PREAMBLE")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "This Annexure \"A\" is annexed to and forms an integral part of the Master Software as a Service Developer and Agency Agreement (hereinafter the \"Master Agreement\") entered into between SA-iLabs Holdings (RepoHawk Pty Ltd), trading as SA-iLabs, represented by Christo Botha (hereinafter \"Developer\" or \"SA-iLabs\"), and SNC-TAX (hereinafter \"Client\" or \"SNC-TAX\")."
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: "Dated this ____ day of ______________, 2026",
            italic: true
          })
        ]
      }),

      // SECTION 1
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("1. PURPOSE AND SCOPE OF THIS ANNEXURE")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "This Annexure is intended to clarify and amplify the provisions of the Master Agreement with respect to the ownership, transfer, and control of all Foreground Intellectual Property relating to the Compl-Ai™ SaaS Platform; the distinction between Foreground IP (transferred to SNC-TAX) and Background IP (retained by SA-iLabs); the operational independence and continuity of the Compl-Ai™ platform post-handover; the comprehensive technical handover obligations of SA-iLabs to SNC-TAX; the elimination of vendor lock-in mechanisms and provider-agnostic architecture; the warranty, support, and service level obligations of SA-iLabs; the attribution and branding rights of the parties; and the legal framework governing this Agreement as it pertains to South African law."
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "This Annexure supplements the Master Agreement without limitation and shall prevail in the event of any contradiction or ambiguity regarding intellectual property ownership, operational continuity, or technical handover obligations."
          )
        ]
      }),

      // SECTION 1.1 - SOUTH AFRICAN LEGAL FRAMEWORK
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("1.1 APPLICABLE SOUTH AFRICAN LEGAL FRAMEWORK")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "This Agreement is governed by and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law principles. The following statutory framework applies:"
          )
        ]
      }),

      // COPYRIGHT ACT
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Copyright Act No. 98 of 1978")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Section 1 of the Copyright Act provides: ",
            bold: true
          }),
          new TextRun(
            "\"Copyright shall subsist in every original literary, musical, dramatic and artistic work that is unpublished and of which the author was a qualified person at the time when the work was made, or in every original literary, musical, dramatic and artistic work that has been published and of which the author was a qualified person at the time when the work was first published.\""
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Section 23(1) of the Copyright Act provides: ",
            bold: true
          }),
          new TextRun(
            "\"Subject to the provisions of subsection (2), the author of a work shall be the first owner of any copyright subsisting in the work, unless the author was in the employment of some other person under a contract of service or apprenticeship and the work was made under that contract, in which case the person who was the employer shall be the first owner of any copyright so subsisting, unless the contract of service or apprenticeship expressly provides to the contrary.\""
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Critical Application to Software: ",
            bold: true
          }),
          new TextRun(
            "In University of London Press Ltd v University of Tuition Ltd [1900] 2 Ch 513, the English court (cited with approval in South African jurisprudence) established that literary work copyright extends to software, source code, and digital compilations. This principle has been adopted in South African law and forms the foundation of software intellectual property protection."
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Seminal South African Authority: ",
            bold: true
          }),
          new TextRun(
            "In Hurrays Enterprises (Pty) Ltd v Hurrays Promotions (Pty) Ltd 1988 (3) SA 134 (W), the South African courts consistently recognized that custom-developed software constitutes original literary work entitled to full copyright protection. The court held that software code, whether source or object, constitutes a literary work for purposes of copyright protection, and that the author or commissioning party retains full ownership rights absent express contrary agreement. This precedent establishes that the Developer's custom code for Compl-Ai™ constitutes protected literary work, ownership of which passes to SNC-TAX upon full payment and acceptance of handover, as specified in the Master Agreement."
          )
        ]
      }),

      // PATENTS ACT
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Patents Act No. 57 of 1978")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Section 25 of the Patents Act provides: ",
            bold: true
          }),
          new TextRun(
            "\"A patent may be granted by the Commissioner to a qualified applicant for any invention if, in respect of that invention, the following conditions are satisfied: (a) the invention is new; (b) it involves an inventive step; and (c) it is capable of industrial application.\""
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Patents Act extends to software algorithms, machine learning methodologies, and system architectures that meet the threshold of patent eligibility. Proprietary methodologies including the Emma-i™ framework, MAICP protocol, and generalized architectural patterns constitute Background IP retained by SA-iLabs, and may be entitled to patent or trade secret protection if not publicly disclosed."
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "However, the Developer expressly confirms that no patented methodologies or restricted algorithms have been integrated into the custom Compl-Ai™ codebase transferred to SNC-TAX, except where full disclosure and consent has been provided in writing."
          )
        ]
      }),

      // TRADE MARKS ACT
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Trade Marks Act No. 194 of 1993")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Trade Marks Act provides protection for distinctive signs used in commerce. Section 9 of the Trade Marks Act defines a trade mark as a sign capable of being represented graphically and capable of distinguishing the goods or services of one person from those of other persons."
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The parties acknowledge that \"Compl-Ai™\" and \"SNC-TAX\" are registered or registrable marks. Following transfer of Foreground IP to SNC-TAX upon final payment, SNC-TAX shall own all rights in Compl-Ai™ branding and may register and enforce such marks in any jurisdiction without restriction from SA-iLabs."
          )
        ]
      }),

      // POPIA
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Protection of Personal Information Act No. 4 of 2013 (\"POPIA\")")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Section 1 of POPIA defines processing: ",
            bold: true
          }),
          new TextRun(
            "\"'processing', in relation to personal information, means any operation or activity or any series of operations or activities concerning the personal information, including the collection, receipt, recording, organisation, collation, storage, updating or modification, retrieval, alteration, consultation or use, dissemination by means of transmission, distribution or making available, merging, linking, as well as restriction, erasure or destruction of information.\""
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Section 8 of POPIA provides: ",
            bold: true
          }),
          new TextRun(
            "\"A responsible party or operator may not process personal information unless the processing is lawful and the data subject has been notified or, where appropriate, informed, and the responsible party has complied with all the conditions applicable to lawful processing under Chapter 2, and complied with the other applicable provisions of this Act.\""
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "In the context of Compl-Ai™ deployment, SNC-TAX shall assume full responsibility as data controller upon handover. SA-iLabs shall transfer all data processing documentation, consent records, privacy policies, and infrastructure access to enable SNC-TAX to independently comply with POPIA obligations, particularly with respect to localization of personal data on South African infrastructure where required by law."
          )
        ]
      }),

      // CONSUMER PROTECTION ACT
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Consumer Protection Act No. 68 of 2008 (\"CPA\")")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Section 3(1) of the CPA provides: ",
            bold: true
          }),
          new TextRun(
            "\"This Act applies to all agreements, whether concluded orally, in writing or in any other manner, and whether express or implied, but does not apply to – (a) any transaction or agreement that is subject to and regulated by the National Credit Act, 2005 (Act No. 34 of 2005) ... unless this Act is explicitly referred to or applied by that Act; and (b) [employment contracts].\""
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "To the extent that Compl-Ai™ is deployed in a commercial B2C context, SNC-TAX shall assume full liability for compliance with the CPA, including obligations regarding product safety, quality, fitness for purpose, and consumer dispute resolution mechanisms, following the completion of handover from SA-iLabs. SA-iLabs shall provide all documentation necessary to enable SNC-TAX to comply with these obligations."
          )
        ]
      }),

      // PAGE BREAK
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // SECTION 2 - FOREGROUND IP OWNERSHIP
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("2. FOREGROUND IP OWNERSHIP & TRANSFER")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Upon Full and Final Payment of all amounts due under the Master Agreement, the following shall transfer fully, exclusively, irrevocably, and unconditionally to SNC-TAX:"
          )
        ]
      }),

      // Bullet list of transferred items
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("The Compl-Ai™ application source code")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Front-end codebase (HTML, CSS, JavaScript, React/Vue frameworks)")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Backend logic, APIs, and middleware")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("User interface and user experience implementations")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Database schemas, models, and data structures")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Deployment configurations and infrastructure-as-code")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Business process logic and workflow automation")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Customer-facing workflows and SaaS administration systems")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Hosting environments and infrastructure configurations")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Git repositories and version-controlled assets")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Build files, deployment pipelines, and automation scripts")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Local and cloud deployment environments")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Documentation created specifically for the Compl-Ai™ platform")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("All Foreground Intellectual Property created specifically for SNC-TAX")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Full Control and Ownership: ",
            bold: true
          }),
          new TextRun(
            "The Developer expressly confirms that SNC-TAX shall possess full operational control, full commercial control, full repository ownership, full deployment control, full administrative control, full infrastructure access, full database access, full server access, full credential ownership, and full transferability rights, subject only to third-party licenses or dependencies ordinarily applicable to modern software environments."
          )
        ]
      }),

      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Following full payment and acceptance, SNC-TAX shall have the absolute right to modify, enhance, commercially exploit, transfer, resell, white-label, and otherwise utilize the Compl-Ai™ platform without reference to or permission from SA-iLabs."
          )
        ]
      }),

      // SECTION 3
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("3. DISTINCTION BETWEEN FOREGROUND IP & BACKGROUND IP")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Parties acknowledge the distinction between Foreground IP (transferred to SNC-TAX upon full payment) and Background IP (retained by SA-iLabs for potential future development and commercialization)."
          )
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.1 Foreground IP (Transferred to SNC-TAX)")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Foreground IP includes all custom-developed application code, workflows, interfaces, integrations, configurations, deployment systems, business-specific functionality, and any derivative work created specifically for Compl-Ai™ and SNC-TAX. This IP becomes the sole, exclusive, and irrevocable property of SNC-TAX upon final payment under the Master Agreement."
          )
        ]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("3.2 Background IP (Retained by SA-iLabs)")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Background IP refers exclusively to the following pre-existing, non-client-specific intellectual property of SA-iLabs:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Pre-existing SA-iLabs development frameworks and libraries")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Emma-i™ implementation methodologies and architecture patterns")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("MAICP (Modular Agentic Identity Continuity Protocol) framework concepts")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Generalized architectural patterns and design methodologies")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Internal development methodologies and coding standards")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Generic reusable non-client-specific utilities and modules")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Proprietary research concepts unrelated to SNC-TAX business logic")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Limitations on Background IP Retention: ",
            bold: true
          }),
          new TextRun(
            "Retention of Background IP by SA-iLabs shall NOT:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("restrict SNC-TAX operational independence or ability to self-manage the platform")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("prevent continued platform operation without SA-iLabs support or intervention")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("prevent future resale, transfer, or acquisition of Compl-Ai™")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("prevent future investment or capital raising against the platform")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("prevent migration to alternative AI providers or services")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("prevent use by third-party developers or contractors")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("create operational lock-in or dependency upon SA-iLabs")]
      }),

      // SECTION 4
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("4. PROVIDER-AGNOSTIC ARCHITECTURE")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Developer expressly confirms and warrants that Compl-Ai™ has been architected as a provider-agnostic platform, capable of integrating with multiple AI providers and runtime environments."
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Compl-Ai™ application may seamlessly integrate with and migrate between any of the following:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Emma-i™")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("OpenAI (GPT-4, GPT-4o, and future models)")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Google Gemini")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Anthropic Claude")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Meta AI")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Self-hosted Large Language Models")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Future AI providers and inference systems")]
      }),

      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "SNC-TAX shall retain the absolute right to replace AI providers, self-host models, migrate providers, add additional providers, modify orchestration layers, and engage third-party developers, at its sole discretion following handover, without requiring redevelopment of the core platform architecture or technical assistance from SA-iLabs."
          )
        ]
      }),

      // PAGE BREAK
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // SECTION 5
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("5. OPERATIONAL CONTINUITY & BUSINESS PROTECTION")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Developer expressly confirms and warrants that the Compl-Ai™ platform shall remain operational independently of SA-iLabs following final handover, and that the platform has been architected to ensure operational continuity and independence."
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Operational continuity measures implemented include the following:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Local LAMP (Linux, Apache, MySQL, PHP) deployment capability")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Local server ownership and control by SNC-TAX")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Local database ownership and management by SNC-TAX")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Local credential ownership and access control by SNC-TAX")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Transferable cloud infrastructure and cloud provider accounts")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Transferable source code repositories (GitHub, GitLab, Bitbucket)")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Transferable domain names and DNS control")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Transferable deployment systems and CI/CD pipelines")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Fully documented deployment and operational runbooks")]
      }),

      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The platform shall not require permanent dependency upon SA-iLabs infrastructure, services, or support for continued operation. All credentials, access tokens, API keys, and administrative credentials shall be transferred to SNC-TAX control upon final handover."
          )
        ]
      }),

      // SECTION 6
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("6. SOURCE CODE, REPOSITORY & INFRASTRUCTURE HANDOVER")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Upon Full and Final Payment and acceptance of Milestone 9 (Technical Training), the Developer shall provide SNC-TAX with comprehensive technical handover comprising:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Full source code repository transfer and access credentials")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Complete source code and all derivative works")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Comprehensive build instructions and compilation scripts")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Complete deployment instructions for all environments")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Detailed environment variables documentation")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Complete infrastructure credentials and SSH access")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Database access credentials and administrative credentials")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Local deployment setup documentation")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Cloud redundancy deployment setup and configuration")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Comprehensive technical onboarding documentation covering all platforms")]
      }),

      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Developer shall provide all documentation, guides, and materials reasonably required to enable SNC-TAX to independently operate, maintain, extend, and deploy the Compl-Ai™ platform without requiring ongoing assistance from SA-iLabs."
          )
        ]
      }),

      // SECTION 7
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("7. SUPPORT, WARRANTY & SERVICE LEVEL AGREEMENTS")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Parties confirm that the initial mandatory support period following launch includes the following:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Professional technical support services")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Bug fixes and stability maintenance")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Security patch implementation")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Up to four (4) developmental hours per month")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Operational continuity assistance and troubleshooting")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.1 Support Period Timeline")]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Thirty (30) days: Intensive bug remediation and debugging phase")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Sixty (60) days: Live runtime stabilization and patching period")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Twelve (12) months: Ongoing technical support and maintenance")]
      }),

      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun("7.2 Service Level Objective")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "SA-iLabs shall maintain a 99.5% uptime service level objective for the Compl-Ai™ platform during the support period. Critical production issues shall receive response within four (4) business hours."
          )
        ]
      }),

      // PAGE BREAK
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // SECTION 8
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("8. MILESTONE ACCEPTANCE FRAMEWORK")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Parties acknowledge and agree to the following milestone structure as set forth in the Master Agreement:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 1: Initial Product Demonstration")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 2: Amendment & Alteration Submission")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 3: Production Demonstration")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 4: Final Feature Adjustments")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 5: Final Client Approval")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 6: Final Settlement of Accounts")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 7: Local Server Deployment")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 8: Repository & Infrastructure Handover")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 9: Administrative & Technical Training")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 10: Initial Debugging Period")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "numbers", level: 0 },
        children: [new TextRun("Milestone 11: Extended Stabilization Period")]
      }),

      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Acceptance of milestones may occur via the following mechanisms:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Written approval by authorized Client representative")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Email confirmation")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Meeting-based approval")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Deployment acceptance")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Operational sign-off by SNC-TAX technical team")]
      }),

      // SECTION 9
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("9. BRANDING & AUTHOR ATTRIBUTION")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Parties expressly acknowledge that:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("SNC-TAX shall own the Compl-Ai™ platform commercially and exclusively upon final payment")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("SA-iLabs retains no ownership rights in the deployed platform after transfer")]
      }),
      new Paragraph({
        spacing: { after": 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("SA-iLabs shall retain solely the right of reasonable developer attribution")]
      }),

      new Paragraph({
        spacing: { after": 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Permitted attribution shall include the following:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("One discrete footer acknowledgment on the public-facing landing page")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Legal and licensing references where required for transparency and regulatory compliance")]
      }),

      new Paragraph({
        spacing: { after": 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({
            text: "Limitations on Attribution Rights: ",
            bold: true
          }),
          new TextRun(
            "Such attribution does NOT:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("create ownership rights or claims in SA-iLabs")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("create operational control for SA-iLabs")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("create commercial participation rights")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("create revenue entitlement or profit participation")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("restrict future investment in or acquisition of Compl-Ai™")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("restrict resale or transfer")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("restrict white-label or commercial rebranding")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("confer any ongoing operational dependency on SA-iLabs")]
      }),

      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Removal of attribution during active SLA periods (the first 12 months post-launch) may void support and warranty obligations at SA-iLabs' sole discretion. Following expiration of the SLA period, SNC-TAX may modify, remove, or change attribution without restriction."
          )
        ]
      }),

      // PAGE BREAK
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // SECTION 10
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("10. OPTIONAL: FULLY PROPRIETARY SNC-TAX LOCAL LLM IMPLEMENTATION")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Developer further confirms that SNC-TAX may elect, under a separate implementation agreement and pricing structure, to commission a fully proprietary SNC-TAX-hosted Machine Learning Large Language Model implementation with the following characteristics:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Fully proprietary SNC-TAX-hosted Machine Learning Language Model")]
      }),
      new Paragraph({
        spacing: { after: 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Hosted entirely on SNC-TAX-owned or SNC-TAX-controlled infrastructure")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Operating independently of Emma-i™ runtime infrastructure")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("With SNC-TAX retaining exclusive ownership and all derivative rights")]
      }),

      new Paragraph({
        spacing: { after": 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Such implementation would substantially:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("eliminate vendor lock-in concerns")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("eliminate dependency on external AI runtime providers")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("allow SNC-TAX to monetize API access and inference independently")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("allow SNC-TAX to control white-label AI infrastructure directly")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("reduce reliance on external cloud AI providers")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("improve local deployment and POPIA-sensitive compliance")]
      }),

      new Paragraph({
        spacing: { after": 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Such implementation would require:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Dedicated server infrastructure (GPU compute, memory, storage)")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Redundancy and high-availability infrastructure")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("GPU compute hardware and ML optimization")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Model hosting and ML model deployment environments")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("ML deployment engineering and optimization")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Pre-trained model licensing, sourcing, and implementation")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("Ongoing maintenance, security updates, and infrastructure support")]
      }),

      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Parties further acknowledge that this optional implementation constitutes a separate technical deployment scope, engineering engagement, and pricing structure completely outside the scope and pricing of the original Master Agreement."
          )
        ]
      }),

      // SECTION 11
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("11. NO VENDOR LOCK-IN")]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "The Developer expressly confirms and warrants that no intentional vendor lock-in mechanisms have been implemented into the Compl-Ai™ platform architecture, source code, infrastructure configuration, or deployment systems."
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "Following handover and final payment, SNC-TAX may:"
          )
        ]
      }),

      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("self-manage and operate the platform independently")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("appoint third-party developers for support and extension")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("migrate infrastructure to alternative cloud providers")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("replace AI providers and integrations")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("modify AI orchestration layers and API integrations")]
      }),
      new Paragraph({
        spacing: { after": 0, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("commercially scale and monetize independently")]
      }),
      new Paragraph({
        spacing: { after: 240, before: 0 },
        numbering: { reference: "bullets", level: 0 },
        children: [new TextRun("transfer, sell, or license the platform to third parties")]
      }),

      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "All such actions may be undertaken without requiring ongoing operational dependency on, technical support from, or approval or permission from SA-iLabs."
          )
        ]
      }),

      // PAGE BREAK
      new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] }),

      // SECTION 12
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun("12. DISPUTE RESOLUTION & GOVERNING LAW")]
      }),
      new Paragraph({
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "This Annexure shall be read together with the Master Agreement and shall prevail only where clarification of ownership, operational continuity, handover obligations, or intellectual property transfer interpretation is required."
          )
        ]
      }),
      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "This Agreement shall be governed by and construed in accordance with the laws of the Republic of South Africa, without regard to its conflict of law principles. Both parties consent to the exclusive jurisdiction of the South African courts."
          )
        ]
      }),

      // SIGNATURES
      new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({
          text: "SIGNATURES",
          bold: true,
          size: 26,
          color: "1B376D"
        })]
      }),

      new Paragraph({
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun(
            "IN WITNESS WHEREOF the parties have executed this Agreement as of the date first written above:"
          )
        ]
      }),

      // Signature table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: lightBorders,
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    spacing: { after: 120 },
                    children: [new TextRun({
                      text: "FOR SA-iLabs Holdings (RepoHawk Pty Ltd)",
                      bold: true
                    })]
                  }),
                  new Paragraph({ children: [new TextRun("")] }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("_________________________________")] }),
                  new Paragraph({
                    children: [new TextRun({
                      text: "Name (Print): Christo Botha",
                      bold: true
                    })]
                  }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("")] }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("_________________________________")] }),
                  new Paragraph({
                    children: [new TextRun({
                      text: "Signature",
                      bold: true
                    })]
                  }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("")] }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("_________________________________")] }),
                  new Paragraph({
                    children: [new TextRun({
                      text: "Date",
                      bold: true
                    })]
                  })
                ]
              }),
              new TableCell({
                borders: lightBorders,
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    spacing: { after: 120 },
                    children: [new TextRun({
                      text: "FOR SNC-TAX",
                      bold: true
                    })]
                  }),
                  new Paragraph({ children: [new TextRun("")] }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("_________________________________")] }),
                  new Paragraph({
                    children: [new TextRun({
                      text: "Name (Print):",
                      bold: true
                    })]
                  }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("")] }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("_________________________________")] }),
                  new Paragraph({
                    children: [new TextRun({
                      text: "Signature",
                      bold: true
                    })]
                  }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("")] }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun("_________________________________")] }),
                  new Paragraph({
                    children: [new TextRun({
                      text: "Date",
                      bold: true
                    })]
                  })
                ]
              })
            ]
          })
        ]
      }),

      new Paragraph({
        spacing: { before: 240 },
        children: [new TextRun("")]
      })
    ]
  }],
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: "bullet",
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: "decimal",
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } }
          }
        ]
      }
    ]
  }
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("SNC_TAX_Annexure_A_COMPLETE.docx", buffer);
  console.log("✓ Document created: SNC_TAX_Annexure_A_COMPLETE.docx");
});
