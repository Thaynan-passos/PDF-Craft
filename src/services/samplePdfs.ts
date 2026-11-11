import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface SampleDoc {
  id: string;
  title: string;
  description: string;
  iconName: string;
  create: () => Promise<Uint8Array>;
}

export const sampleTemplates: SampleDoc[] = [
  {
    id: 'contract',
    title: 'Contrato de Prestação de Serviços',
    description: 'Contrato comercial de 2 páginas com cláusulas, tabela de valores e campo para assinatura',
    iconName: 'FileText',
    create: async () => {
      const pdfDoc = await PDFDocument.create();
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // --- Page 1 ---
      const page1 = pdfDoc.addPage([595.28, 841.89]); // A4 in points
      const { width, height } = page1.getSize();

      // Header Banner
      page1.drawRectangle({
        x: 40,
        y: height - 80,
        width: width - 80,
        height: 44,
        color: rgb(0.12, 0.16, 0.24),
      });

      page1.drawText('CONTRATO DE PRESTAÇÃO DE SERVIÇOS PROFISSIONAIS', {
        x: 55,
        y: height - 58,
        size: 13,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });

      page1.drawText('INSTRUMENTO PARTICULAR Nº 2026/0488 - VIA ORIGINAL', {
        x: 55,
        y: height - 72,
        size: 8,
        font: helvetica,
        color: rgb(0.7, 0.75, 0.85),
      });

      // Partes
      let y = height - 110;
      page1.drawText('1. DAS PARTES CONTRATANTES', {
        x: 40,
        y,
        size: 11,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.15),
      });

      y -= 18;
      const contratante = 'CONTRATANTE: NEXUS TECNOLOGIA & SOLUÇÕES DIGITAIS LTDA, inscrita no CNPJ sob o nº 12.345.678/0001-90, com sede na Av. Paulista, 1800, São Paulo/SP.';
      page1.drawText(contratante, {
        x: 40,
        y,
        size: 9,
        font: helvetica,
        maxWidth: width - 80,
        lineHeight: 14,
        color: rgb(0.25, 0.25, 0.3),
      });

      y -= 34;
      const contratado = 'CONTRATADO: STUDIO DESIGN & DESENVOLVIMENTO DE SOFTWARE LTDA, com sede na Av. Brigadeiro Faria Lima, 2500, conjunto 402, São Paulo/SP.';
      page1.drawText(contratado, {
        x: 40,
        y,
        size: 9,
        font: helvetica,
        maxWidth: width - 80,
        lineHeight: 14,
        color: rgb(0.25, 0.25, 0.3),
      });

      // Cláusulas
      y -= 35;
      page1.drawText('2. DO OBJETO DO CONTRATO', {
        x: 40,
        y,
        size: 11,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.15),
      });

      y -= 18;
      const objeto = '2.1. O presente instrumento tem por objeto a prestação de serviços especializados de desenvolvimento de software em nuvem, arquitetura de sistemas, auditoria de código-fonte e suporte técnico continuado de acordo com as especificações anexas ao presente termo.';
      page1.drawText(objeto, {
        x: 40,
        y,
        size: 9,
        font: helvetica,
        maxWidth: width - 80,
        lineHeight: 14,
        color: rgb(0.25, 0.25, 0.3),
      });

      y -= 45;
      page1.drawText('3. DOS PRAZOS E CRONOGRAMA DE ENTREGAS', {
        x: 40,
        y,
        size: 11,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.15),
      });

      // Tabela de Entregas
      y -= 22;
      page1.drawRectangle({
        x: 40,
        y: y - 100,
        width: width - 80,
        height: 100,
        borderColor: rgb(0.82, 0.85, 0.9),
        borderWidth: 1,
        color: rgb(0.98, 0.98, 1),
      });

      // Table Header
      page1.drawRectangle({
        x: 40,
        y: y - 24,
        width: width - 80,
        height: 24,
        color: rgb(0.92, 0.94, 0.98),
      });

      page1.drawText('ETAPA', { x: 50, y: y - 16, size: 8, font: helveticaBold, color: rgb(0.2, 0.25, 0.35) });
      page1.drawText('DESCRIÇÃO DA ENTREGA', { x: 130, y: y - 16, size: 8, font: helveticaBold, color: rgb(0.2, 0.25, 0.35) });
      page1.drawText('PRAZO ESTIMADO', { x: 380, y: y - 16, size: 8, font: helveticaBold, color: rgb(0.2, 0.25, 0.35) });
      page1.drawText('STATUS', { x: 480, y: y - 16, size: 8, font: helveticaBold, color: rgb(0.2, 0.25, 0.35) });

      // Rows
      page1.drawText('Fase 01', { x: 50, y: y - 42, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('Levantamento de requisitos e UI/UX Wireframes', { x: 130, y: y - 42, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('15 dias úteis', { x: 380, y: y - 42, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('Concluído', { x: 480, y: y - 42, size: 8, font: helveticaBold, color: rgb(0.1, 0.6, 0.2) });

      page1.drawText('Fase 02', { x: 50, y: y - 66, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('Implementação Frontend & Backend API REST', { x: 130, y: y - 66, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('30 dias úteis', { x: 380, y: y - 66, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('Em Andamento', { x: 480, y: y - 66, size: 8, font: helveticaBold, color: rgb(0.8, 0.5, 0.1) });

      page1.drawText('Fase 03', { x: 50, y: y - 90, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('Testes de Carga, Homologação e Deploy', { x: 130, y: y - 90, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('10 dias úteis', { x: 380, y: y - 90, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText('Pendente', { x: 480, y: y - 90, size: 8, font: helvetica, color: rgb(0.5, 0.5, 0.5) });

      // Confidential notice box
      page1.drawRectangle({
        x: 40,
        y: 60,
        width: width - 80,
        height: 38,
        borderColor: rgb(0.9, 0.7, 0.3),
        borderWidth: 1,
        color: rgb(1, 0.98, 0.92),
      });

      page1.drawText('NOTA DE CONFIDENCIALIDADE: Este documento contém informações sensíveis da organização.', {
        x: 52,
        y: 80,
        size: 8,
        font: helveticaBold,
        color: rgb(0.6, 0.4, 0.1),
      });
      page1.drawText('Qualquer divulgação parcial ou total sem autorização prévia expressa é estritamente proibida por lei.', {
        x: 52,
        y: 68,
        size: 7.5,
        font: helvetica,
        color: rgb(0.6, 0.4, 0.1),
      });

      // --- Page 2 ---
      const page2 = pdfDoc.addPage([595.28, 841.89]);
      const p2Height = page2.getHeight();

      page2.drawText('4. DO VALOR E DAS CONDIÇÕES DE PAGAMENTO', {
        x: 40,
        y: p2Height - 60,
        size: 11,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.15),
      });

      const pagamento = '4.1. Pelos serviços contratados, o CONTRATANTE pagará ao CONTRATADO o montante global de R$ 48.000,00 (quarenta e oito mil reais), dividido em 4 (quatro) parcelas mensais e sucessivas de R$ 12.000,00, com vencimento a cada dia 10 do mês subsequente às entregas homologadas.';
      page2.drawText(pagamento, {
        x: 40,
        y: p2Height - 82,
        size: 9,
        font: helvetica,
        maxWidth: width - 80,
        lineHeight: 14,
        color: rgb(0.25, 0.25, 0.3),
      });

      page2.drawText('5. DO FORO E DISPOSIÇÕES GERAIS', {
        x: 40,
        y: p2Height - 145,
        size: 11,
        font: helveticaBold,
        color: rgb(0.1, 0.1, 0.15),
      });

      const foro = '5.1. Para dirimir quaisquer controvérsias oriundas do presente Contrato, as partes elegem o Foro Central da Comarca de São Paulo/SP, com renúncia expressa a qualquer outro, por mais privilegiado que seja.\n\nE, por estarem assim justas e contratadas, assinam o presente documento eletronicamente.';
      page2.drawText(foro, {
        x: 40,
        y: p2Height - 165,
        size: 9,
        font: helvetica,
        maxWidth: width - 80,
        lineHeight: 14,
        color: rgb(0.25, 0.25, 0.3),
      });

      page2.drawText('São Paulo, 12 de Março de 2026.', {
        x: 40,
        y: p2Height - 240,
        size: 10,
        font: helvetica,
        color: rgb(0.2, 0.2, 0.2),
      });

      // Signature Fields boxes
      // Box 1 - Contratante
      page2.drawRectangle({
        x: 40,
        y: p2Height - 380,
        width: 230,
        height: 100,
        borderColor: rgb(0.7, 0.75, 0.85),
        borderWidth: 1,
        color: rgb(0.98, 0.99, 1),
      });
      page2.drawLine({
        start: { x: 55, y: p2Height - 340 },
        end: { x: 255, y: p2Height - 340 },
        color: rgb(0.6, 0.65, 0.75),
        thickness: 0.8,
      });
      page2.drawText('NEXUS TECNOLOGIA LTDA', {
        x: 65,
        y: p2Height - 355,
        size: 8.5,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      page2.drawText('Representante Legal (Contratante)', {
        x: 65,
        y: p2Height - 368,
        size: 7.5,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      page2.drawText('[ ASSINAR AQUI ]', {
        x: 105,
        y: p2Height - 315,
        size: 8,
        font: helvetica,
        color: rgb(0.6, 0.6, 0.7),
      });

      // Box 2 - Contratado
      page2.drawRectangle({
        x: width - 270,
        y: p2Height - 380,
        width: 230,
        height: 100,
        borderColor: rgb(0.7, 0.75, 0.85),
        borderWidth: 1,
        color: rgb(0.98, 0.99, 1),
      });
      page2.drawLine({
        start: { x: width - 255, y: p2Height - 340 },
        end: { x: width - 55, y: p2Height - 340 },
        color: rgb(0.6, 0.65, 0.75),
        thickness: 0.8,
      });
      page2.drawText('STUDIO DESIGN & DEV LTDA', {
        x: width - 245,
        y: p2Height - 355,
        size: 8.5,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      page2.drawText('Diretor Executivo (Contratado)', {
        x: width - 245,
        y: p2Height - 368,
        size: 7.5,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      page2.drawText('[ ASSINAR AQUI ]', {
        x: width - 200,
        y: p2Height - 315,
        size: 8,
        font: helvetica,
        color: rgb(0.6, 0.6, 0.7),
      });

      return await pdfDoc.save();
    },
  },
  {
    id: 'report',
    title: 'Relatório Executivo Mensal',
    description: 'Relatório com resumo de KPIs, metas atingidas e observações',
    iconName: 'BarChart2',
    create: async () => {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();

      // Top brand stripe
      page.drawRectangle({
        x: 0,
        y: height - 12,
        width,
        height: 12,
        color: rgb(0.2, 0.45, 0.9),
      });

      page.drawText('RELATÓRIO DE DESEMPENHO E RESULTADOS', {
        x: 45,
        y: height - 55,
        size: 16,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.25),
      });

      page.drawText('Competência: Fevereiro / 2026 · Departamento Comercial & Operações', {
        x: 45,
        y: height - 72,
        size: 9,
        font,
        color: rgb(0.4, 0.45, 0.55),
      });

      // 3 KPI Cards
      const cardWidth = (width - 90 - 24) / 3;
      const kpis = [
        { label: 'RECEITA TOTAL', val: 'R$ 384.500', change: '+18.4% vs mês ant.', color: rgb(0.1, 0.6, 0.3) },
        { label: 'NOVOS CLIENTES', val: '142', change: '+32 contas ativas', color: rgb(0.2, 0.45, 0.9) },
        { label: 'NPS GERAL', val: '94 / 100', change: 'Zona de Excelência', color: rgb(0.8, 0.45, 0.1) },
      ];

      kpis.forEach((kpi, idx) => {
        const x = 45 + idx * (cardWidth + 12);
        page.drawRectangle({
          x,
          y: height - 170,
          width: cardWidth,
          height: 75,
          borderColor: rgb(0.85, 0.88, 0.92),
          borderWidth: 1,
          color: rgb(0.97, 0.98, 1),
        });

        page.drawText(kpi.label, { x: x + 12, y: height - 118, size: 8, font: fontBold, color: rgb(0.45, 0.5, 0.6) });
        page.drawText(kpi.val, { x: x + 12, y: height - 142, size: 15, font: fontBold, color: rgb(0.1, 0.15, 0.25) });
        page.drawText(kpi.change, { x: x + 12, y: height - 158, size: 7.5, font, color: kpi.color });
      });

      // Executive Summary
      let y = height - 210;
      page.drawText('RESUMO EXECUTIVO DAS METAS', { x: 45, y, size: 12, font: fontBold, color: rgb(0.1, 0.15, 0.25) });
      y -= 18;
      const summary = 'Durante o período analisado, observou-se aceleração no fechamento de contratos de grande porte no segmento Enterprise. A taxa de retenção foi de 98,2%, superando a meta estabelecida para o primeiro trimestre.\n\nRecomenda-se aprovação orçamentária para expansão da equipe de engenharia e suporte para atender à nova demanda projetada.';
      page.drawText(summary, {
        x: 45,
        y,
        size: 9.5,
        font,
        maxWidth: width - 90,
        lineHeight: 15,
        color: rgb(0.25, 0.25, 0.3),
      });

      // Approval stamp area
      y -= 130;
      page.drawRectangle({
        x: 45,
        y: y - 80,
        width: width - 90,
        height: 80,
        borderColor: rgb(0.8, 0.85, 0.9),
        borderWidth: 1,
        color: rgb(0.98, 0.99, 1),
      });

      page.drawText('PARECER DA DIRETORIA E APROVAÇÃO', { x: 60, y: y - 24, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.35) });
      page.drawText('Insira carimbo ou anotação de aprovação/revisão neste espaço.', { x: 60, y: y - 42, size: 8.5, font, color: rgb(0.5, 0.55, 0.65) });

      return await pdfDoc.save();
    },
  },
  {
    id: 'blank',
    title: 'Documento em Branco (A4)',
    description: 'Página em branco para criar certificados, memorandos ou documentos do zero',
    iconName: 'Plus',
    create: async () => {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.addPage([595.28, 841.89]);
      return await pdfDoc.save();
    },
  },
];
