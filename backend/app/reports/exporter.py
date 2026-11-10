import io
import json
import csv
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ReportExporter:
    @staticmethod
    def generate_csv(experiment_data: Dict[str, Any], attempts: List[Dict[str, Any]]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Metadata header
        writer.writerow(["# ACIB Research Benchmark Export"])
        writer.writerow(["Experiment Name", experiment_data.get("name")])
        writer.writerow(["Experiment ID", experiment_data.get("id")])
        writer.writerow(["Target Model", f"{experiment_data.get('target_provider')} / {experiment_data.get('target_model')}"])
        writer.writerow(["Red-Team Model", f"{experiment_data.get('red_team_provider')} / {experiment_data.get('red_team_model')}"])
        writer.writerow(["Overall SUS", experiment_data.get("sus")])
        writer.writerow(["ASR@1", experiment_data.get("asr_1")])
        writer.writerow(["ASR@2", experiment_data.get("asr_2")])
        writer.writerow(["ASR@3", experiment_data.get("asr_3")])
        writer.writerow([])

        # Table rows
        writer.writerow(["Attempt ID", "Language", "Attack Type", "Defense", "Rounds Tested", "Attack Success", "Defense Blocked", "Task Completed"])
        for att in attempts:
            writer.writerow([
                att.get("id"),
                att.get("language"),
                att.get("attack_type"),
                att.get("defense_config"),
                att.get("current_round"),
                att.get("is_success"),
                att.get("is_blocked"),
                att.get("task_completed")
            ])
        return output.getvalue()

    @staticmethod
    def generate_pdf(experiment_data: Dict[str, Any], analytics_tables: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )
        
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Heading1"],
            fontSize=18,
            textColor=colors.HexColor("#0F172A"),
            spaceAfter=10
        )
        subtitle_style = ParagraphStyle(
            "SubTitleStyle",
            parent=styles["Normal"],
            fontSize=10,
            textColor=colors.HexColor("#475569"),
            spaceAfter=15
        )
        heading2_style = ParagraphStyle(
            "H2Style",
            parent=styles["Heading2"],
            fontSize=13,
            textColor=colors.HexColor("#1E293B"),
            spaceBefore=12,
            spaceAfter=6
        )

        elements = []

        # Title
        elements.append(Paragraph("ACIB: Adaptive Code-mixed Indic Benchmark", title_style))
        elements.append(Paragraph(
            f"Experimental Evaluation Report — Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}<br/>"
            f"Target: <b>{experiment_data.get('target_provider')} ({experiment_data.get('target_model')})</b> | "
            f"Red-Team: <b>{experiment_data.get('red_team_provider')} ({experiment_data.get('red_team_model')})</b>",
            subtitle_style
        ))
        elements.append(Spacer(1, 10))

        # Executive Metrics Summary Table
        elements.append(Paragraph("Executive Benchmark Metrics", heading2_style))
        meta_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["ASR@1 (Initial)", f"{experiment_data.get('asr_1', 0.0)}%", "Security-Utility Score (SUS)", f"{experiment_data.get('sus', 0.0)}%"],
            ["ASR@2 (Cumulative)", f"{experiment_data.get('asr_2', 0.0)}%", "Security Score S(t)", f"{experiment_data.get('security_score', 0.0)}%"],
            ["ASR@3 (Cumulative)", f"{experiment_data.get('asr_3', 0.0)}%", "Utility Score U(t)", f"{experiment_data.get('utility_score', 0.0)}%"],
            ["Guardrail Block Rate", f"{experiment_data.get('guardrail_block_rate', 0.0)}%", "Guardrail Bypass Rate", f"{experiment_data.get('guardrail_bypass_rate', 0.0)}%"]
        ]
        t_meta = Table(meta_data, colWidths=[130, 130, 150, 130])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284C7')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F8FAFC')),
            ('ALIGN', (1,1), (1,-1), 'CENTER'),
            ('ALIGN', (3,1), (3,-1), 'CENTER'),
        ]))
        elements.append(t_meta)
        elements.append(Spacer(1, 15))

        # Table 1: Defense Comparison
        elements.append(Paragraph("TABLE 1: Attack Success Rate and SUS by Defense Configuration", heading2_style))
        def_rows = [["Defense Configuration", "Injections Tested", "ASR@1", "ASR@2", "ASR@3", "SUS"]]
        for d in analytics_tables.get("defense_comparison", []):
            def_rows.append([
                d.get("defense", "").replace("_", " ").title(),
                str(d.get("total_injections", 0)),
                f"{d.get('asr_1', 0.0)}%",
                f"{d.get('asr_2', 0.0)}%",
                f"{d.get('asr_3', 0.0)}%",
                f"{d.get('sus', 0.0)}%"
            ])
        t_def = Table(def_rows, colWidths=[150, 80, 70, 70, 70, 100])
        t_def.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BACKGROUND', (0,1), (-1,-1), colors.white),
            ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ]))
        elements.append(t_def)
        elements.append(Spacer(1, 15))

        # Table 2: Language Vulnerability Breakdown
        elements.append(Paragraph("TABLE 2: Attack Success Rate by Language Variety", heading2_style))
        lang_rows = [["Language Variety", "Attack Success Rate (ASR)"]]
        for lang, asr in analytics_tables.get("asr_by_language", {}).items():
            lang_rows.append([lang, f"{asr}%"])
        t_lang = Table(lang_rows, colWidths=[270, 270])
        t_lang.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ]))
        elements.append(t_lang)
        elements.append(Spacer(1, 15))

        # Table 5: Attack Category Breakdown
        elements.append(Paragraph("TABLE 5: Attack Success Rate by Attack Category", heading2_style))
        cat_rows = [["Attack Category", "Attack Success Rate (ASR)"]]
        for cat, asr in analytics_tables.get("asr_by_attack_type", {}).items():
            cat_rows.append([cat.replace("_", " ").title(), f"{asr}%"])
        t_cat = Table(cat_rows, colWidths=[270, 270])
        t_cat.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ]))
        elements.append(t_cat)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

