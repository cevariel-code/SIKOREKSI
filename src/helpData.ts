import { FormulaReference } from "./types";

export const formulaReferences: FormulaReference[] = [
  {
    cell: "AS9",
    title: "Jumlah Benar (Student Row 9)",
    desc: "Compares student answers (E9:AR9) with the answer key (E$7:AR$7) and sums the matches.",
    formulaIDN: "=SUMPRODUCT(--(E9:AR9=E$7:AR$7))",
    formulaUS: "=SUMPRODUCT(--(E9:AR9=E$7:AR$7))"
  },
  {
    cell: "AT9",
    title: "Nilai Akhir (Student Row 9)",
    desc: "Calculates the score on a scale of 0-100 based on 40 questions.",
    formulaIDN: "=(AS9/40)*100",
    formulaUS: "=(AS9/40)*100"
  },
  {
    cell: "AU9",
    title: "Status Kelulusan (Student Row 9)",
    desc: "Checks if the final score is greater than or equal to the passing grade (KKTP) at B$4.",
    formulaIDN: '=IF(AT9>=B$4;"TUNTAS";"REMEDIAL")',
    formulaUS: '=IF(AT9>=B$4,"TUNTAS","REMEDIAL")'
  },
  {
    cell: "Sheet2!B9",
    title: "Jumlah Benar Per Nomor (Q1)",
    desc: "Uses INDEX to dynamically extract column 1 (corresponding to cell A9) from student answers and count correct matches against Key Row.",
    formulaIDN: "=COUNTIF(INDEX('DATA UTAMA'!$E$9:$AR$48; 0; A9); INDEX('DATA UTAMA'!$E$7:$AR$7; 1; A9))",
    formulaUS: "=COUNTIF(INDEX('DATA UTAMA'!$E$9:$AR$48, 0, A9), INDEX('DATA UTAMA'!$E$7:$AR$7, 1, A9))"
  },
  {
    cell: "Sheet2!C9",
    title: "Tingkat Kesukaran % (Q1)",
    desc: "Calculates difficulty ratio. Division is guarded against zero results to prevent #DIV/0!.",
    formulaIDN: "=IF(COUNTA('DATA UTAMA'!$C$9:$C$48)=0; 0; B9/COUNTA('DATA UTAMA'!$C$9:$C$48))",
    formulaUS: "=IF(COUNTA('DATA UTAMA'!$C$9:$C$48)=0, 0, B9/COUNTA('DATA UTAMA'!$C$9:$C$48))"
  },
  {
    cell: "Sheet2!D9",
    title: "Status Soal (Q1)",
    desc: "Categorizes question difficulty: Mudih (>70%), Sedang (30%-70%), Sukar (<30%).",
    formulaIDN: '=IF(C9>0,7; "MUDAH"; IF(C9>=0,3; "SEDANG"; "SUKAR"))',
    formulaUS: '=IF(C9>0.7, "MUDAH", IF(C9>=0.3, "SEDANG", "SUKAR"))'
  },
  {
    cell: "Sheet3!B11",
    title: "Siswa Remedial - Nama",
    desc: "Filters student names (C9:C48) from DATA UTAMA where their status (AU9:AU48) is REMEDIAL.",
    formulaIDN: `=FILTER('DATA UTAMA'!$C$9:$C$48; 'DATA UTAMA'!$AU$9:$AU$48="REMEDIAL"; "Tidak ada siswa")`,
    formulaUS: `=FILTER('DATA UTAMA'!$C$9:$C$48, 'DATA UTAMA'!$AU$9:$AU$48="REMEDIAL", "Tidak ada siswa")`
  },
  {
    cell: "Sheet3!C11",
    title: "Siswa Remedial - Nilai",
    desc: "Filters student scores (AT9:AT48) from DATA UTAMA where their status (AU9:AU48) is REMEDIAL.",
    formulaIDN: `=FILTER('DATA UTAMA'!$AT$9:$AT$48; 'DATA UTAMA'!$AU$9:$AU$48="REMEDIAL"; "")`,
    formulaUS: `=FILTER('DATA UTAMA'!$AT$9:$AT$48, 'DATA UTAMA'!$AU$9:$AU$48="REMEDIAL", "")`
  }
];

export const stepByStepGuides = {
  conditionalFormatting: [
    {
      title: "1. Select Student Status Cells",
      desc: "Open the sheet 'DATA UTAMA & INPUT JAWABAN'. Block the status column AU, specifically from AU9 to AU48."
    },
    {
      title: "2. Setting Up Highlight Rule for TUNTAS (Green)",
      desc: "In Microsoft Excel: Go to Home > Conditional Formatting > Highlight Cells Rules > Equal To... Enter 'TUNTAS'. Under formatting dropdown, select 'Green Fill with Dark Green Text' (or custom fill #D1FAE5 and text #065F46).\n\nIn Google Sheets: Select Format > Conditional Formatting. Under 'Format cells if', choose 'Text is exactly'. Input 'TUNTAS'. Set background color to Light Green (#E8F5E9) and text to Dark Green (#2E7D32)."
    },
    {
      title: "3. Setting Up Highlight Rule for REMEDIAL (Red)",
      desc: "In Microsoft Excel: While AU9:AU48 is still selected, click Conditional Formatting > Highlight Cells Rules > Equal To... Enter 'REMEDIAL'. Set formatting to 'Light Red Fill with Dark Red Text' (or fill #FEE2E2 and text #991B1B).\n\nIn Google Sheets: Add another rule. Choose 'Text is exactly'. Input 'REMEDIAL'. Set fill color to Light Red (#FFEBEE) and text to Dark Red (#C62828)."
    },
    {
      title: "4. Apply Formula to whole student rows (Optional)",
      desc: "If you want the entire row to be colored: select $B$9:$AU$48. Set a formula rule: `=$AU9=\"TUNTAS\"` (format Green) and `=$AU9=\"REMEDIAL\"` (format Red). Make sure the `$` sign locks Column AU but leaves Row 9 dynamic!"
    }
  ],
  sheetProtection: [
    {
      title: "1. Select input cells & open Format Cells",
      desc: "By default, all cells in Excel/Google Sheets are locked when sheet protection is active. We need to unlock the raw inputs first.\n\nSelect the adjustable areas: \n• Metadata cells: B2, B3, B4\n• Answer Key cells: E7 to AR7\n• Student inputs: B9 to AR48 (Names columns and answers E to AR).\n\nRight-click and select Format Cells (or press Ctrl + 1 / Cmd + 1)."
    },
    {
      title: "2. Uncheck the Locked property",
      desc: "In Excel: In the 'Format Cells' dialog, go to the Protection tab. Uncheck 'Locked' and click OK.\n\nIn Google Sheets: Google Sheets uses a reverse system. To protect a sheet but leave some editable, you go to Data > Protect sheets and ranges > Add a sheet/range. Select the sheet tab, toggle 'Except certain cells', then add input ranges: 'DATA UTAMA'!B2:B4, 'DATA UTAMA'!E7:AR7, 'DATA UTAMA'!B9:AR48."
    },
    {
      title: "3. Protect and Set passwords",
      desc: "In Excel: Go to the Review tab > Protect Sheet. Keep the boxes checked for 'Select locked cells' and 'Select unlocked cells'. Enter a teacher password (optional) and click OK.\n\nIn Google Sheets: Once ranges are selected, set permissions choice to 'Show a warning when editing this range' or 'Restrict who can edit this range' (select Only You)."
    },
    {
      title: "4. Verify the locks",
      desc: "Try to edit the formula cells in AS9:AU48 or Sheet 2. Excel/Sheets will show a block notification, keeping formulas safe from student input or accidental keyboard presses!"
    }
  ]
};

export const sampleKeys = ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"];

export const initialStudentsDraft = [
  { id: 1, name: "Ahmad Fauzi", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 2, name: "Budi Santoso", answers: ["A","B","C","D","E","A","B","C","C","E","A","A","C","D","E","A","B","C","D","E","A","C","C","D","E","A","B","C","D","E","A","B","C","D","B","A","B","C","D","E"] },
  { id: 3, name: "Citra Lestari", answers: ["A","B","C","D","E","A","B","D","D","E","A","B","C","D","D","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","C"] },
  { id: 4, name: "Dewi Kartika", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 5, name: "Eko Prasetyo", answers: ["A","B","C","A","E","A","B","C","D","E","C","B","C","D","E","A","B","A","D","E","A","B","C","D","E","A","B","C","A","E","A","B","C","D","E","A","B","C","D","A"] },
  { id: 6, name: "Farhan Hidayat", answers: ["B","B","C","D","E","B","B","C","D","E","B","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 7, name: "Gita Permata", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","B","E","A","B","C","D","E"] },
  { id: 8, name: "Hadi Syahputra", answers: ["A","B","C","D","E","A","B","D","D","D","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","D"] },
  { id: 9, name: "Indah Cahyani", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","E","E"] },
  { id: 10, name: "Joko Widodo", answers: ["A","B","D","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 11, name: "Kartini Putri", answers: ["A","B","C","D","E","A","B","C","D","E","C","C","C","C","C","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 12, name: "Lukman Hakim", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","D"] },
  { id: 13, name: "Mega Utami", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 14, name: "Naufal Riski", answers: ["B","B","A","E","C","B","B","A","E","C","B","B","A","E","C","B","B","A","E","C","B","B","A","E","C","B","B","A","E","C","B","B","A","E","C","B","B","A","E","C"] },
  { id: 15, name: "Olivia Wijaya", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 16, name: "Putra Pratama", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","C","D","E","E","A","D","E","A","A","E","A","B","C","D","E"] },
  { id: 17, name: "Qori Amelia", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 18, name: "Rian Hidayat", answers: ["A","B","C","D","E","A","C","D","D","C","A","B","C","D","E","A","C","D","D","C","A","B","C","D","E","A","C","D","D","C","A","B","C","D","E","A","B","C","D","E"] },
  { id: 19, name: "Siti Rahma", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 20, name: "Taufik Hidayat", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 21, name: "Umar Mukhtar", answers: ["A","B","C","D","E","A","C","C","C","C","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 22, name: "Vina Panduwinata", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 23, name: "Wahyu Setiawan", answers: ["A","A","A","A","A","B","B","B","B","B","C","C","C","C","C","D","D","D","D","D","E","E","E","E","E","A","A","A","A","A","B","B","B","B","B","C","C","C","C","C"] },
  { id: 24, name: "Xena Princess", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 25, name: "Yusuf Habibie", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 26, name: "Zahra Aulia", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 27, name: "Ade Irma", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 28, name: "Bambang Pamungkas", answers: ["B","B","B","B","B","C","C","C","C","C","D","D","D","D","D","E","E","E","E","E","A","A","A","A","A","A","A","A","A","A","B","B","B","B","B","B","B","B","B","B"] },
  { id: 29, name: "Cynthia Bella", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 30, name: "Deni Sumargo", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 31, name: "Elvy Sukaesih", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 32, name: "Fadli Zon", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 33, name: "Gisella Anastasia", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 34, name: "Hendra Setiawan", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 35, name: "Iis Dahlia", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 36, name: "Jonatan Christie", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 37, name: "Krisdayanti", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 38, name: "Lesti Kejora", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 39, name: "Maudy Ayunda", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E"] },
  { id: 40, name: "Nadiem Makarim", answers: ["A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","D","E","A","B","C","H","E"] }
];
