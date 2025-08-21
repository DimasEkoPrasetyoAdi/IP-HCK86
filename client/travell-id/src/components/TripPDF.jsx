import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// PDF theme aligned with app (cyan / teal accents)
const colors = {
  bgSoft: '#F1FAFE',
  accent: '#06B6D4', // cyan-500
  accentSoft: '#CFF8FF',
  textDark: '#0F2E43',
  border: '#BEE4EF',
  chipBg: '#E0F9FF'
};

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: 'Helvetica', backgroundColor: '#FFFFFF', color: colors.textDark },
  titleBar: { backgroundColor: colors.accent, padding: 14, borderRadius: 10, marginBottom: 18 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtitle: { fontSize: 13, marginVertical: 8, fontWeight: 'bold', color: colors.accent },
  meta: { fontSize: 10, color: '#0F2E43' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  tag: { fontSize: 9, marginRight: 6, marginBottom: 6, backgroundColor: colors.chipBg, paddingVertical: 4, paddingHorizontal: 6, borderRadius: 4, border: `1 solid ${colors.border}` },
  section: { marginTop: 6, padding: 10, backgroundColor: colors.bgSoft, borderRadius: 8, border: `1 solid ${colors.border}` },
  dayBlock: { marginBottom: 14, padding: 10, border: `1 solid ${colors.border}`, borderRadius: 6, backgroundColor: '#FFFFFF' },
    dayHeading: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
    dayHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    // Higher contrast (light background, dark text) per user request
    weatherBadge: { backgroundColor: '#F5F9FB', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, border: `1 solid ${colors.border}`, flexDirection: 'row', alignItems: 'center' },
    weatherText: { fontSize: 8, color: '#000000', fontWeight: 'bold' },
    weatherCond: { fontSize: 8, fontWeight: 'bold', color: '#000000', marginRight: 6, textTransform: 'uppercase' },
  activity: { marginBottom: 6, fontSize: 10 },
  activityDesc: { fontSize: 9, color: '#345668' },
  activityDuration: { fontSize: 8, color: '#447789', marginTop: 2 },
  activityHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  activityTime: { fontSize: 8, color: '#000000', fontWeight: 'bold', marginRight: 6, minWidth: 32 },
  activityDur: { fontSize: 8, color: '#000000', fontWeight: 'bold', marginLeft: 8 },
  activityTitle: { fontSize: 10, fontWeight: 'bold', color: '#000000' },
  footer: { position: 'absolute', bottom: 20, left: 32, right: 32, textAlign: 'center', fontSize: 9, color: '#4B6B7A' }
});

export default function TripPDF({ trip }) {
  const itinerary = trip?.itinerary?.itinerary || trip?.itinerary || [];
  const interests = trip.interest || [];
  const daily = trip?.weather?.dailySummary || [];
  const durationDays = trip.startDate && trip.endDate ? (Math.round((new Date(trip.endDate)-new Date(trip.startDate))/86400000) + 1) : (itinerary.length || '');
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.titleBar}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={{ fontSize: 10, color: '#E0FDFF', marginTop: 4 }}>{trip.city} • {trip.startDate} → {trip.endDate} ({durationDays} hari)</Text>
        </View>
        {interests.length > 0 && (
          <View style={styles.chipsWrap}>
            {interests.map((t,i)=>(<Text key={i} style={styles.tag}>{t}</Text>))}
          </View>
        )}
        {trip.note_markdown && (
          <View style={styles.section}>
            <Text style={styles.subtitle}>Notes</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.3 }}>{trip.note_markdown}</Text>
          </View>
        )}
        <View style={{ marginTop: 14 }}>
          <Text style={styles.subtitle}>Itinerary</Text>
          {Array.isArray(itinerary) && itinerary.map(day => {
            const wx = daily[day.day - 1];
            return (
              <View key={day.day} style={styles.dayBlock} wrap={false}>
                <View style={styles.dayHeaderRow}>
                  <Text style={styles.dayHeading}>Day {day.day}</Text>
                  {wx && (
                    <View style={styles.weatherBadge}>
                      <Text style={styles.weatherCond}>{wx.condition}</Text>
                      <Text style={styles.weatherText}>{wx.temp_min}°C - {wx.temp_max}°C • {wx.precipitation_mm} mm</Text>
                    </View>
                  )}
                </View>
                {(day.activities || []).map((a,i)=>(
                  <View key={i} style={styles.activity}>
                    <View style={styles.activityHeaderRow}>
                      <Text style={styles.activityTime}>{a.time || ''}</Text>
                      <View style={{ flex:1 }}>
                        <Text style={styles.activityTitle}>{a.activity}</Text>
                      </View>
                      {a.duration && <Text style={styles.activityDur}>{a.duration}</Text>}
                    </View>
                    {a.description && <Text style={styles.activityDesc}>{a.description}</Text>}
                  </View>
                ))}
              </View>
            );
          })}
        </View>
        <Text style={styles.footer}>Generated by Travell-ID • {new Date().toLocaleDateString()}</Text>
      </Page>
    </Document>
  );
}
