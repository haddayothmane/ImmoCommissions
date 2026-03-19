@php
    $arabic = new \ArPHP\I18N\Arabic();
    $f = function($text) use ($arabic) {
        return $arabic->utf8Glyphs($text);
    };
@endphp
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="utf-8">
    <title>Contrat de Vente - {{ $contract->id }}</title>
    <style>
        @page {
            margin: 2cm;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
            text-align: right;
            direction: ltr; /* ArPHP handles RTL visually in LTR */
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #10b981;
            padding-bottom: 10px;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #065f46;
            background: #f0fdf4;
            padding: 5px 10px;
            margin-bottom: 10px;
            text-align: right;
        }
        .grid {
            width: 100%;
            border-collapse: collapse;
            direction: ltr; /* Keep LTR for the engine */
        }
        .grid td {
            padding: 8px;
            border: 1px solid #e5e7eb;
            text-align: right;
        }
        .label {
            font-weight: bold;
            background-color: #f9fafb;
            width: 30%;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
        }
        .signature {
            margin-top: 50px;
            width: 100%;
        }
        .signature td {
            width: 50%;
            text-align: center;
            height: 100px;
            vertical-align: top;
        }
        table.payments {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table.payments th, table.payments td {
            border: 1px solid #e5e7eb;
            padding: 8px;
            text-align: center;
        }
        table.payments th {
            background-color: #f3f4f6;
        }
        .rtl-text {
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $f('عقد بيع عقار') }}</h1>
        <p>{{ $f('رقم العقد') }}: {{ $contract->id }} | {{ $f('بتاريخ') }}: {{ $contract->created_at->format('d/m/Y') }}</p>
    </div>

    <div class="section">
        <div class="section-title">{{ $f('معلومات البائع (الوكالة)') }}</div>
        <table class="grid">
            <tr>
                <td>{{ $contract->agency_name_fixed ?? $f($contract->agency->name ?? 'ImmoCommissions') }}</td>
                <td class="label">{{ $f('اسم الوكالة') }}</td>
            </tr>
            <tr>
                <td>{{ $contract->agency_city_fixed ?? $f($contract->agency->city ?? '-') }}</td>
                <td class="label">{{ $f('المدينة') }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">{{ $f('معلومات المشتري (الزبون)') }}</div>
        <table class="grid">
            <tr>
                <td>{{ $contract->client_nom_fixed ?? $f($contract->client->nom) }}</td>
                <td class="label">{{ $f('الاسم الكامل') }}</td>
            </tr>
            <tr>
                <td>{{ $contract->client->cin }}</td>
                <td class="label">{{ $f('رقم البطاقة الوطنية (CIN)') }}</td>
            </tr>
            <tr>
                <td>{{ $contract->client->telephone }}</td>
                <td class="label">{{ $f('الهاتف') }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">{{ $f('تفاصيل العقار') }}</div>
        <table class="grid">
            <tr>
                <td>
                    @if(str_contains($contract->target_type, 'Appartement')) {{ $f('شقة') }}
                    @elseif(str_contains($contract->target_type, 'Immeuble')) {{ $f('عمارة') }}
                    @else {{ $f('أرض') }} @endif
                </td>
                <td class="label">{{ $f('نوع العقار') }}</td>
            </tr>
            <tr>
                <td>
                    {{ $contract->target_name_fixed ?? '-' }}
                </td>
                <td class="label">{{ $f('المعرف / الاسم') }}</td>
            </tr>
            <tr>
                <td>{{ $contract->target->surface ?? '-' }} m²</td>
                <td class="label">{{ $f('المساحة') }}</td>
            </tr>
            @if(isset($contract->target->ville))
            <tr>
                <td>{{ $contract->target_city_fixed ?? $f($contract->target->ville) }}</td>
                <td class="label">{{ $f('المدينة') }}</td>
            </tr>
            @endif
        </table>
    </div>

    <div class="section">
        <div class="section-title">{{ $f('الشروط المالية') }}</div>
        <table class="grid">
            <tr>
                <td style="font-weight: bold; font-size: 14px;">{{ number_format($contract->total_sale_price, 2) }} {{ $f('درهم') }}</td>
                <td class="label">{{ $f('سعر البيع المتفق عليه') }}</td>
            </tr>
            <tr>
                <td>{{ $contract->payment_type === 'totalite' ? $f('دفعة واحدة') : $f('على أقساط') }}</td>
                <td class="label">{{ $f('طريقة الدفع') }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">{{ $f('جدول الدفعات') }}</div>
        <table class="payments">
            <thead>
                <tr>
                    <th>{{ $f('تاريخ الاستحقاق') }}</th>
                    <th>{{ $f('الوصف') }}</th>
                    <th>{{ $f('المبلغ (درهم)') }}</th>
                    <th>{{ $f('الحالة') }}</th>
                </tr>
            </thead>
            <tbody>
                @foreach($contract->milestones as $m)
                <tr>
                    <td dir="ltr">{{ \Carbon\Carbon::parse($m->due_date)->format('d/m/Y') }}</td>
                    <td>{{ $m->label_fixed ?? $f($m->label) }}</td>
                    <td>{{ number_format($m->amount, 2) }}</td>
                    <td>{{ $m->status === 'paid' ? $f('تم الأداء') : $f('في الانتظار') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <table class="signature">
        <tr>
            <td>
                <strong>{{ $f('توقيع الزبون') }}</strong>
                <br><br><br>
                ..........................................
            </td>
            <td>
                <strong>{{ $f('توقيع واختم الوكالة') }}</strong>
                <br><br><br>
                ..........................................
            </td>
        </tr>
    </table>

    <div class="footer">
        {{ $f('تم إنشاء هذا العقد تلقائياً عبر منصة ImmoCommissions') }}
    </div>
</body>
</html>
