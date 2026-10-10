import React, { useState } from 'react';
import { Alert, ScrollView, Share, Switch, Text, TextInput, View } from 'react-native';
import { Btn } from '../components/ui';
import { allWords } from '../data';
import { speak } from '../speech';
import { useProgress } from '../store';
import { radius, useTheme } from '../theme';

const GOALS = [10, 20, 30, 50];
const THEMES = [['system', '📱 אוטומטי'], ['light', '☀️ בהיר'], ['dark', '🌙 כהה']];
const RATES = [[0.6, 'איטי'], [0.85, 'רגיל'], [1.0, 'מהיר']];

export default function MoreScreen() {
  const t = useTheme();
  const { s, update, exportData, importData, reset } = useProgress();
  const [imp, setImp] = useState('');
  const card = { backgroundColor: t.card, borderRadius: radius, borderWidth: 1, borderColor: t.line, padding: 16, gap: 12 };
  const title = { fontSize: 17, fontWeight: '800', color: t.ink };
  const set = (patch) => update((p) => ({ ...p, ...patch }));

  const Seg = ({ items, value, onPick }) => (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {items.map(([k, label]) => (
        <Btn key={String(k)} onPress={() => onPick(k)} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: value === k ? t.accent : t.soft }}>
          <Text style={{ fontWeight: '800', fontSize: 13, color: value === k ? t.onAccent : t.ink }}>{label}</Text>
        </Btn>
      ))}
    </View>
  );
  const Row = ({ label, value, onChange }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
      <Text style={{ color: t.ink, fontWeight: '700', flex: 1 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: t.accent }} />
    </View>
  );

  const known = Object.keys(s.known).length;
  const acc = s.qs.total ? Math.round((s.qs.correct / s.qs.total) * 100) : 0;
  const doImport = () => {
    try { importData(imp.trim()); setImp(''); Alert.alert('בוצע', 'ההתקדמות שוחזרה.'); }
    catch (e) { Alert.alert('שגיאה', 'קוד הגיבוי אינו תקין.'); }
  };
  const doReset = () => Alert.alert('איפוס התקדמות', 'למחוק את כל המילים הידועות, המועדפים, הנקודות והסטטיסטיקה?', [
    { text: 'ביטול', style: 'cancel' }, { text: 'מחיקה', style: 'destructive', onPress: reset },
  ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 28, fontWeight: '800', color: t.ink }}>עוד ⚙️</Text>

      <View style={card}>
        <Text style={title}>📊 הסטטיסטיקה שלי</Text>
        {[
          ['מילים ידועות', `${known} מתוך ${allWords.length}`], ['מועדפים', Object.keys(s.fav).length],
          ['חידונים שהושלמו', s.qs.played], ['דיוק בחידונים', `${acc}%`], ['שיא אישי', `${s.best}%`], ['נקודות', s.xp],
        ].map(([a, b]) => (
          <View key={a} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: t.muted }}>{a}</Text><Text style={{ color: t.ink, fontWeight: '800' }}>{b}</Text>
          </View>
        ))}
      </View>

      <View style={card}>
        <Text style={title}>🎨 תצוגה</Text>
        <Seg items={THEMES} value={s.theme} onPick={(v) => set({ theme: v })} />
      </View>

      <View style={card}>
        <Text style={title}>🔊 קול ותחושה</Text>
        <Row label="הקראה אוטומטית בכרטיסיות" value={s.auto} onChange={(v) => set({ auto: v })} />
        <Row label="רטט עדין" value={s.haptics} onChange={(v) => set({ haptics: v })} />
        <Text style={{ color: t.ink, fontWeight: '700' }}>מהירות הקראה</Text>
        <Seg items={RATES} value={s.rate} onPick={(v) => { set({ rate: v }); setTimeout(() => speak('Hello, how are you?'), 150); }} />
        <Text style={{ color: t.muted, fontSize: 12 }}>הקראה בלי אינטרנט דורשת קול אנגלי מותקן במכשיר (הגדרות ← מערכת ← שפה ← פלט טקסט לדיבור).</Text>
      </View>

      <View style={card}>
        <Text style={title}>🃏 למידה</Text>
        <Row label="כרטיסיות: עברית קודם" value={s.heFirst} onChange={(v) => set({ heFirst: v })} />
        <Text style={{ color: t.ink, fontWeight: '700' }}>יעד יומי (פעולות)</Text>
        <Seg items={GOALS.map((g) => [g, String(g)])} value={s.goal} onPick={(v) => set({ goal: v })} />
      </View>

      <View style={card}>
        <Text style={title}>💾 גיבוי ושחזור</Text>
        <Text style={{ color: t.muted }}>שמור את ההתקדמות בהודעה או בהערה, והדבק כאן כדי לשחזר (למשל במכשיר חדש).</Text>
        <Btn onPress={() => Share.share({ message: exportData() })} style={{ backgroundColor: t.soft, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}>
          <Text style={{ color: t.ink, fontWeight: '800' }}>📤 ייצוא ההתקדמות</Text>
        </Btn>
        <TextInput value={imp} onChangeText={setImp} placeholder="הדבק כאן קוד גיבוי" placeholderTextColor={t.muted} multiline autoCorrect={false} autoCapitalize="none"
          style={{ backgroundColor: t.bg, borderWidth: 1, borderColor: t.line, borderRadius: 14, padding: 12, minHeight: 60, color: t.ink }} />
        <Btn onPress={doImport} disabled={!imp.trim()} style={{ backgroundColor: t.accent, borderRadius: 14, paddingVertical: 13, alignItems: 'center' }}>
          <Text style={{ color: t.onAccent, fontWeight: '800' }}>📥 שחזור</Text>
        </Btn>
      </View>

      <Btn onPress={doReset} style={{ backgroundColor: t.badSoft, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ color: t.bad, fontWeight: '800' }}>איפוס התקדמות</Text>
      </Btn>
      <Text style={{ color: t.muted, textAlign: 'center', fontSize: 12 }}>English Offline · {allWords.length} מילים וביטויים</Text>
    </ScrollView>
  );
}
