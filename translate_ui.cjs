const fs = require('fs');

let p = fs.readFileSync('resources/js/pages/Paiements.tsx', 'utf8');

// Using basic string replacements to add translations with fallbacks
p = p.replace('>GESTION DES PAIEMENTS<', '>{t("paiements_title", "GESTION DES PAIEMENTS")}<')
 .replace('>Historique complet des règlements et génération de reçus officiels.<', '>{t("paiements_subtitle", "Historique complet des règlements et génération de reçus officiels.")}<')
 .replace('>Total Encaissé<', '>{t("total_collected", "Total Encaissé")}<')
 .replace('>Paiements ce mois<', '>{t("payments_this_month", "Paiements ce mois")}<')
 .replace('>Transactions<', '>{t("transactions", "Transactions")}<')
 .replace('>Dernière transaction<', '>{t("last_transaction", "Dernière transaction")}<')
 .replace('"Rechercher par client ou référence..."', '{t("search_payment_placeholder", "Rechercher par client ou référence...")}')
 .replace('>Filtres avancés<', '>{t("advanced_filters", "Filtres avancés")}<')
 .replace('>Aucun paiement trouvé<', '>{t("no_payment_found", "Aucun paiement trouvé")}<')
 .replace('>Il semble qu\'aucun règlement ne corresponde à votre recherche pour le moment.<', '>{t("no_payment_desc", "Il semble qu\'aucun règlement ne corresponde à votre recherche pour le moment.")}<')
 .replace('>Date & Réf.<', '>{t("date_ref", "Date & Réf.")}<')
 .replace('>Client<', '>{t("client", "Client")}<')
 .replace('>Bien / Description<', '>{t("property_desc", "Bien / Description")}<')
 .replace('>Montant<', '>{t("amount", "Montant")}<')
 .replace('>Action<', '>{t("action", "Action")}<')
 .replace('>Reçu PDF<', '>{t("receipt_pdf", "Reçu PDF")}<')
 .replace('"Versement"', 't("installment", "Versement")')
 .replace('"Contrat global"', 't("global_contract", "Contrat global")');

fs.writeFileSync('resources/js/pages/Paiements.tsx', p);

let c = fs.readFileSync('resources/js/pages/Commissions.tsx', 'utf8');

c = c.replace('>GESTION DES COMMISSIONS<', '>{t("commissions_title", "GESTION DES COMMISSIONS")}<')
 .replace('>Suivi des rétributions agents et historique des paiements.<', '>{t("commissions_subtitle", "Suivi des rétributions agents et historique des paiements.")}<')
 .replace('>Nouvelle Commission<', '>{t("new_commission", "Nouvelle Commission")}<')
 .replace('>Total Commissions<', '>{t("total_commissions", "Total Commissions")}<')
 .replace('>Montant Payé<', '>{t("amount_paid", "Montant Payé")}<')
 .replace('>Reste à Payer<', '>{t("remaining_to_pay", "Reste à Payer")}<')
 .replace('"Rechercher par agent ou appartement..."', '{t("search_commission_placeholder", "Rechercher par agent ou appartement...")}')
 .replace('>Tous les statuts<', '>{t("all_statuses", "Tous les statuts")}<')
 .replace('>Non payé<', '>{t("status_unpaid", "Non payé")}<')
 .replace('>Partiel<', '>{t("status_partial", "Partiel")}<')
 .replace('>Payé<', '>{t("status_paid", "Payé")}<')
 .replace('>Aucune commission trouvée<', '>{t("no_commission_found", "Aucune commission trouvée")}<')
 .replace('>Agent / Date<', '>{t("agent_date", "Agent / Date")}<')
 .replace('>Appartement<', '>{t("appartement", "Appartement")}<')
 .replace('>Montant Total<', '>{t("total_amount", "Montant Total")}<')
 .replace('>Statut<', '>{t("status", "Statut")}<')
 .replace('Créée le ', '{t("created_at_prefix", "Créée le ")} ')
 .replace('Prix: ', '{t("price", "Prix")} : ')
 .replace('Reste: ', '{t("remaining", "Reste")} : ')
 .replace('>Détails<', '>{t("details", "Détails")}<')
 .replace('Non payé</option>', 't("status_unpaid", "Non payé")}</option>')
 .replace('Partiel</option>', 't("status_partial", "Partiel")}</option>')
 .replace('Payé</option>', 't("status_paid", "Payé")}</option>');

fs.writeFileSync('resources/js/pages/Commissions.tsx', c);
console.log('Done');
