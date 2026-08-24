import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

const dimensions = [
  ['accuracy', 'Үнэн зөв байдал'],
  ['completeness', 'Бүрэн байдал'],
  ['consistency', 'Тууштай байдал'],
  ['uniqueness', 'Давхардалгүй байдал'],
  ['timeliness', 'Цаг үеэ олсон байдал'],
]

const cases = [
  {
    no: 'DQ-CS-01',
    brief: 'Удирдлагын тайланд идэвхтэй харилцагчийн тоо өмнөх сараас огцом өссөн боловч салбарууд ийм өсөлт байгаагүй гэж мэдээлэв.',
    note: 'Сэжигтэй харагдсан утга бүр алдаа биш. Нотолгоотой асуудлыг л flag хий.',
    headers: ['Customer ID', 'Регистр', 'Утас', 'Сарын орлого', 'Эрсдэл', 'Хаяг шинэчилсэн'],
    rows: [
      ['C1041', 'AA90010101', '99112233', '4,500,000 ₮', 'Бага', '2026-07-19'],
      ['C1042', 'BB91021202', '—', '3,200,000 ₮', 'Дунд', '2026-08-02'],
      ['C1043', 'CC92032303', '88114455', '45,000,000 ₮', 'Бага', '2026-08-11'],
      ['C1044', 'DD93041404', '99117744', '5,100,000 ₮', 'Дунд', '2018-04-12'],
      ['C1045', 'EE94052505', '88119922', '3,800,000 ₮', 'Бага', '2026-07-30'],
      ['C1098', 'EE94052505', '88119922', '3,800,000 ₮', 'Бага', '2026-07-30'],
    ],
    issueMap: {
      'm-1-2': { truth: true, dimension: 'completeness', title: 'C1042 · Утас', desc: 'Утасны дугаар хоосон.',
        missed: 'Холбоо барих мэдээлэл дутуу хэвээр үлдэж, кампанит ажлын хамрах хүрээ буурлаа.',
        chain: 'Missing phone → Contact failed → Campaign reach ↓' },
      'm-2-3': { truth: true, dimension: 'accuracy', title: 'C1043 · Орлого', desc: 'CRM дээр 45,000,000 ₮ гэж бүртгэгдсэн.',
        missed: 'Буруу орлогын мэдээлэл эрсдэлийн үнэлгээ болон сегментчилэлд дамжлаа.',
        chain: 'Wrong income → Risk/segment input → Decision distorted' },
      'm-3-5': { truth: true, dimension: 'timeliness', title: 'C1044 · Хаяг шинэчилсэн', desc: 'Хаягийн мэдээлэл 2018 оноос хойш шинэчлэгдээгүй.',
        missed: 'Хуучирсан хаягийн мэдээлэл харилцагчийн дараагийн үйлчилгээний процесст ашиглагдлаа.',
        chain: 'Old address → Outdated profile → Service/contact risk' },
      'm-5-1': { truth: true, dimension: 'uniqueness', title: 'C1098 · Регистр', desc: 'C1045-тай ижил регистрийн дугаартай.',
        missed: 'Давхардсан бүртгэл тайланд хоёул тоологдож, нийт харилцагчийн тоо бодитоос өндөр гарлаа.',
        chain: 'Duplicate record → Double count → Dashboard overstated' },
      's-main': { truth: true, dimension: 'consistency', title: 'CRM / Core · Үлдэгдэл', desc: 'CRM болон Core Banking дээр үлдэгдэл зөрүүтэй.',
        missed: 'Зөрүүтэй хоёр утга тайлангуудад дамжиж, аль дүн албан ёсны болох талаар маргаан үүслээ.',
        chain: 'System mismatch → Conflicting reports → Decision ambiguity' },
      'm-2-4': { truth: false, title: 'C1043 · Эрсдэл', desc: "Эрсдэлийн ангилал 'Бага'.",
        falseConsequence: 'Нотолгоогүйгээр зөв эрсдэлийн ангиллыг буруу гэж тэмдэглэснээр профайл шаардлагагүй дахин шалгалтад орлоо.',
        chain: 'Valid value flagged → Unnecessary review → Process delay' },
      'm-0-3': { truth: false, title: 'C1041 · Орлого', desc: '4.5 сая ₮ сарын орлого.',
        falseConsequence: 'Зөв орлогын мэдээллийг асуудал гэж үзсэнээр чанарын шалгалтын ачаалал нэмэгдлээ.',
        chain: 'Valid value flagged → Extra review → Capacity wasted' },
    },
    systemA: 'CRM: 8.4 сая ₮',
    systemB: 'Core Banking: 8.9 сая ₮',
    reference: 'C1043 баталгаажсан орлого: 4,500,000 ₮',
    history: [
      ['2026-08-11', 'C1043 профайл шинэчлэгдсэн'],
      ['2026-07-30', 'C1045 профайл баталгаажсан'],
      ['2018-04-12', 'C1044 хаяг хамгийн сүүлд шинэчлэгдсэн'],
    ],
    policy: 'Харилцагчийн хаягийн мэдээллийг 24 сар тутам хянаж шинэчилнэ.',
  },
  {
    no: 'DQ-CS-02',
    brief: 'Маркетингийн сегментчиллийн үр дүн өмнөх сараас огцом өөрчлөгдсөн. Бизнесийн баг эх өгөгдөлд асуудал байж болзошгүй гэж үзэж байна.',
    note: 'Зарим талбар хоосон байж болох ч бүгд заавал бөглөх талбар биш.',
    headers: ['Customer ID', 'И-мэйл', 'Салбарын код', 'Төрсөн огноо', 'KYC статус', 'Сүүлд шинэчилсэн'],
    rows: [
      ['C2201', 'bataa@bank.mn', '201', '1990-04-11', 'Баталгаажсан', '2026-08-05'],
      ['C2202', '—', '201', '1988-09-23', 'Баталгаажсан', '2026-08-01'],
      ['C2203', 'saraa@bank.mn', '205', '2045-02-10', 'Баталгаажсан', '2026-07-28'],
      ['C2204', 'tuya@bank.mn', '208', '1994-03-03', 'Баталгаажсан', '2023-01-14'],
      ['C2205', 'enkh@bank.mn', '212', '1985-06-18', 'Баталгаажсан', '2026-08-03'],
      ['C2215', 'enkh@bank.mn', '212', '1985-06-18', 'Баталгаажсан', '2026-08-03'],
    ],
    issueMap: {
      'm-1-1': { truth: true, dimension: 'completeness', title: 'C2202 · И-мэйл', desc: 'И-мэйл хоосон.',
        missed: 'Цахим мэдээлэл хүргэх суваг дутуу үлдэж, төлөвлөсөн харилцаа хүрсэнгүй.',
        chain: 'Missing email → Delivery failure → Communication gap' },
      'm-2-3': { truth: true, dimension: 'accuracy', title: 'C2203 · Төрсөн огноо', desc: 'Төрсөн огноо 2045 он.',
        missed: 'Буруу төрсөн огноо насны шалгалт болон сегментчилэлд дамжин буруу ангилал үүсгэлээ.',
        chain: 'Invalid DOB → Wrong age → Wrong segment' },
      'm-3-5': { truth: true, dimension: 'timeliness', title: 'C2204 · Сүүлд шинэчилсэн', desc: 'KYC мэдээлэл 2023 оноос хойш шинэчлэгдээгүй.',
        missed: 'Хуучирсан KYC мэдээлэл хэрэглээнд үлдэж, харилцагчийн өнөөгийн нөхцөлийг буруу үнэлэх эрсдэл нэмэгдлээ.',
        chain: 'Stale KYC → Outdated profile → Risk assessment weakened' },
      'm-5-0': { truth: true, dimension: 'uniqueness', title: 'C2215 · Customer ID', desc: 'C2205-тай ижил мэдээлэлтэй давхардсан бүртгэл.',
        missed: 'Нэг харилцагч хоёр profile-т хуваагдаж, сегмент болон тооллогод давхар нөлөөллөө.',
        chain: 'Duplicate profile → Duplicate metrics → Segment distortion' },
      's-main': { truth: true, dimension: 'consistency', title: 'CRM / Master · Салбарын код', desc: 'C2201-ийн салбарын код хоёр системд өөр байна.',
        missed: 'Салбарын кодын зөрүү тайлангийн бүлэглэлд дамжиж, салбарын гүйцэтгэл буруу харагдлаа.',
        chain: 'Branch mismatch → Wrong grouping → KPI distorted' },
      'm-0-4': { truth: false, title: 'C2201 · KYC статус', desc: "KYC статус 'Баталгаажсан'.",
        falseConsequence: 'Зөв KYC статусыг асуудал гэж тэмдэглэснээр харилцагч шаардлагагүй дахин баталгаажуулалтад орлоо.',
        chain: 'Valid KYC flagged → Extra verification → Delay' },
      'm-4-2': { truth: false, title: 'C2205 · Салбарын код', desc: 'Салбарын код 212.',
        falseConsequence: 'Зөв салбарын кодыг буруу гэж үзсэнээр шаардлагагүй засварын хүсэлт үүслээ.',
        chain: 'Valid code flagged → Unneeded ticket → Analyst time lost' },
    },
    systemA: 'CRM: салбар 201',
    systemB: 'Master: салбар 204',
    reference: 'C2202 цахим мэдээлэл авах сувгийг идэвхжүүлсэн.',
    history: [
      ['2026-08-05', 'C2201 профайл шинэчлэгдсэн'],
      ['2026-08-03', 'C2205 профайл шинэчлэгдсэн'],
      ['2023-01-14', 'C2204 KYC хамгийн сүүлд хянагдсан'],
    ],
    policy: 'KYC профайлыг байгууллагын тогтоосон мөчлөгөөр тогтмол шинэчилнэ.',
  },
  {
    no: 'DQ-CS-03',
    brief: 'Зээлийн багцын тайлангийн нийт дүн болон гэрээний бүртгэл хооронд зөрүү гарсан.',
    note: 'Хэвийн бус харагдсан тоо бүр буруу биш. Гэрээ, эх систем, түүхэн мэдээлэлтэй тулгаж байж дүгнэлт гарга.',
    headers: ['Loan ID', 'Customer ID', 'Үлдэгдэл', 'Хугацаа', 'Бүтээгдэхүүн', 'Сүүлд шинэчилсэн'],
    rows: [
      ['L3101', 'C3101', '6,800,000 ₮', '24 сар', 'Цалингийн зээл', '2026-08-12'],
      ['L3102', 'C3102', '—', '18 сар', 'Хэрэглээний зээл', '2026-08-11'],
      ['L3103', 'C3103', '12,500,000 ₮', '42 сар', 'Автомашины зээл', '2026-08-10'],
      ['L3104', 'C3104', '3,100,000 ₮', '12 сар', 'Цалингийн зээл', '2021-05-04'],
      ['L3105', 'C3105', '9,400,000 ₮', '24 сар', 'Хэрэглээний зээл', '2026-08-09'],
      ['L3199', 'C3105', '9,400,000 ₮', '24 сар', 'Хэрэглээний зээл', '2026-08-09'],
    ],
    issueMap: {
      'm-1-2': { truth: true, dimension: 'completeness', title: 'L3102 · Үлдэгдэл', desc: 'Идэвхтэй зээлийн үлдэгдэл хоосон.',
        missed: 'Үлдэгдэлгүй мөр багцын нийлбэрт зөв оролцож чадаагүйгээс тайлангийн нийт дүн дутуу гарлаа.',
        chain: 'Missing balance → Aggregation gap → Portfolio understated' },
      'm-2-3': { truth: true, dimension: 'accuracy', title: 'L3103 · Хугацаа', desc: 'Системд 42 сар гэж бүртгэгдсэн.',
        missed: 'Буруу хугацаа төлбөрийн график болон ангиллын тооцоонд дамжин буруу үр дүн үүсгэлээ.',
        chain: 'Wrong term → Schedule logic → Reporting error' },
      'm-3-5': { truth: true, dimension: 'timeliness', title: 'L3104 · Сүүлд шинэчилсэн', desc: '2021 оноос хойш шинэчлэгдээгүй.',
        missed: 'Хуучирсан зээлийн мэдээлэл тайланд үлдэж, өнөөгийн багцын төлөвийг буруу илэрхийллээ.',
        chain: 'Stale loan record → Outdated status → Portfolio view distorted' },
      'm-5-1': { truth: true, dimension: 'uniqueness', title: 'L3199 · Customer ID', desc: 'L3105-тай ижил зээлийн мэдээлэл давхар орсон.',
        missed: 'Давхардсан зээл багцын нийт үлдэгдлийг бодитоос өндөр тооцоход хүргэлээ.',
        chain: 'Duplicate loan → Double count → Portfolio overstated' },
      's-main': { truth: true, dimension: 'consistency', title: 'Warehouse / Loan System · Нийт үлдэгдэл', desc: 'Нийт багцын дүн хоёр системд зөрүүтэй.',
        missed: 'Хоёр өөр нийт дүн удирдлагын тайланд орж, багцын хэмжээг нэг мөр ойлгох боломжгүй боллоо.',
        chain: 'Portfolio mismatch → Conflicting KPI → Management ambiguity' },
      'm-0-2': { truth: false, title: 'L3101 · Үлдэгдэл', desc: '6.8 сая ₮ үлдэгдэл.',
        falseConsequence: 'Зөв үлдэгдлийг асуудал гэж үзсэнээр багцын тайланг шаардлагагүй дахин тооцоолох ажил үүслээ.',
        chain: 'Valid balance flagged → Recalculation → Analyst time lost' },
      'm-4-4': { truth: false, title: 'L3105 · Бүтээгдэхүүн', desc: 'Хэрэглээний зээл.',
        falseConsequence: 'Зөв бүтээгдэхүүний ангиллыг буруу гэж үзсэнээр тайлангийн бүлэглэлд шаардлагагүй өөрчлөлт хийх эрсдэл үүслээ.',
        chain: 'Valid category flagged → Unneeded edit → Reporting risk' },
    },
    systemA: 'Warehouse: 41.2 сая ₮',
    systemB: 'Loan System: 38.1 сая ₮',
    reference: 'L3103 гэрээний хугацаа: 24 сар',
    history: [
      ['2026-08-12', 'L3101 шинэчлэгдсэн'],
      ['2026-08-10', 'L3103 шинэчлэгдсэн'],
      ['2021-05-04', 'L3104 хамгийн сүүлд шинэчлэгдсэн'],
    ],
    policy: 'Идэвхтэй зээлийн бүртгэл тайлагналын мөчлөг бүрт шинэчлэгдсэн байна.',
  },
]

function getMeta(id, c) {
  const map = c.issueMap
  if (map[id]) return map[id]

  if (id === 'reference') {
    return {
      truth: false,
      title: 'Баталгаажсан эх баримт',
      desc: 'Reference мэдээлэл.',
      falseConsequence: 'Баталгаажсан эх баримтыг алдаа гэж тэмдэглэснээр мөрдлөгийн зөв тулгуурыг өөрөө хүчингүй болголоо.',
      chain: 'Reference flagged → Evidence weakened → Investigation quality ↓',
    }
  }

  if (id.startsWith('h-')) {
    return {
      truth: false,
      title: 'Түүхэн бүртгэл',
      desc: 'Түүхийн мөр.',
      falseConsequence: 'Зөв түүхэн бүртгэлийг асуудал гэж үзсэнээр аудитын мөрийг шаардлагагүй засварт шилжүүлэх эрсдэл үүслээ.',
      chain: 'Valid history flagged → Audit trail disturbed → Review burden',
    }
  }

  return {
    truth: false,
    title: 'Хэвийн өгөгдөл',
    desc: 'Нотолгоогоор асуудал гэж тогтоогдоогүй.',
    falseConsequence: 'Зөв өгөгдлийг буруу гэж тэмдэглэснээр шаардлагагүй шалгалт, засварын ажил үүслээ.',
    chain: 'Valid data flagged → Unnecessary action → Process delay',
  }
}

function fmtTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function DataCrimeScene() {
  const [stage, setStage] = useState('intro')
  const [attempt, setAttempt] = useState(1)
  const [selected, setSelected] = useState({})
  const [scores, setScores] = useState([])
  const [seconds, setSeconds] = useState(420)
  const [locked, setLocked] = useState(false)
  const [activeTab, setActiveTab] = useState('master')
  const [modalOpen, setModalOpen] = useState(false)
  const [result, setResult] = useState(null)

  const timerRef = useRef(null)
  const currentCase = cases[attempt - 1]

  useEffect(() => () => clearInterval(timerRef.current), [])

  function startTimer() {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current)
          setTimeout(() => setModalOpen(true), 0)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  function startAttempt(nextAttempt) {
    setLocked(false)
    setSelected({})
    setSeconds(420)
    setActiveTab('master')
    setAttempt(nextAttempt)
    setStage('game')
    startTimer()
  }

  function toggleFlag(id) {
    if (locked) return
    setSelected((prev) => {
      if (id in prev) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: { ...getMeta(id, currentCase), classification: '' } }
    })
  }

  function setClassification(id, value) {
    setSelected((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], classification: value } } : prev))
  }

  function removeFlag(id) {
    if (locked) return
    setSelected((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function openCloseModal() {
    if (locked) return
    setModalOpen(true)
  }

  function closeCase() {
    if (locked) return

    setLocked(true)
    clearInterval(timerRef.current)
    setModalOpen(false)

    const issueEntries = Object.entries(currentCase.issueMap).filter(([, m]) => m.truth)
    let tp = 0, miss = 0, fp = 0, classOk = 0
    const outcomes = []

    issueEntries.forEach(([id, meta]) => {
      if (selected[id]) {
        tp++
        if (selected[id].classification === meta.dimension) classOk++
      } else {
        miss++
        outcomes.push({ type: 'miss', title: `Илрүүлээгүй: ${meta.title}`, text: meta.missed, chain: meta.chain })
      }
    })

    Object.entries(selected).forEach(([id]) => {
      const meta = getMeta(id, currentCase)
      if (!meta.truth) {
        fp++
        outcomes.push({ type: 'false', title: `Үндэслэлгүй сэжиг: ${meta.title}`, text: meta.falseConsequence, chain: meta.chain })
      }
    })

    const detectScore = Math.round((tp / issueEntries.length) * 40)
    const classScore = Math.round((classOk / issueEntries.length) * 20)
    const fpScore = Math.max(0, 20 - fp * 7)
    const completeScore = miss === 0 && fp === 0 ? 20 : 0

    const score = Math.max(0, Math.min(100, detectScore + classScore + fpScore + completeScore))
    const nextScores = [...scores]
    nextScores[attempt - 1] = score
    setScores(nextScores)

    if (!outcomes.length) {
      outcomes.push({
        type: 'good',
        title: 'CLEAN CLOSE',
        text: 'Бодит асуудлуудыг бүрэн илрүүлж, зөв өгөгдлийг шаардлагагүй засварт оруулаагүй. Хэрэг нэмэлт өгөгдлийн хохиролгүй хаагдлаа.',
        chain: 'Issues detected → Correctly classified → No false action',
      })
    }

    setResult({ score, tp, miss, fp, classOk, total: issueEntries.length, outcomes, scoresSnapshot: nextScores })
    setStage('result')
  }

  function backToIntro() {
    clearInterval(timerRef.current)
    setAttempt(1)
    setScores([])
    setSelected({})
    setLocked(false)
    setStage('intro')
  }

  const flagCount = Object.keys(selected).length

  return (
    <div className="dq-game">
      <header className="topbar">
        <Link className="brand" to="/">
          <div className="brand-mark">DQ</div>
          <div>
            <strong>DATA CRIME SCENE</strong>
            <small>Data Quality · Level 2</small>
          </div>
        </Link>
        <div className="attempt-badge">Attempt {attempt} / 3</div>
      </header>

      {stage === 'intro' && (
        <section className="screen active">
          <div className="wrap">
            <div className="intro">
              <div className="intro-main">
                <div className="eyebrow">Level 2 · Diagnose</div>
                <h1>Өгөгдлийн<br />хэргийн газар</h1>
                <p>
                  Хүснэгт, системийн харьцуулалт, түүхэн бүртгэл дундаас асуудлыг өөрөө илрүүл.
                  Сэжигтэй харагдсан утга бүр алдаа биш. Нотолгоогүйгээр зөв өгөгдлийг буруу гэж
                  тэмдэглэх нь өөрөө эрсдэлтэй.
                </p>

                <div className="rules">
                  <div className="rule"><div className="rule-num">01</div><div>Сэжигтэй өгөгдөл дээр дарж <b>FLAG</b> тавина. Хэргийг хаахаас өмнө буцааж болно.</div></div>
                  <div className="rule"><div className="rule-num">02</div><div>Flag бүрийг өгөгдлийн чанарын зөв ангилалд оруулна.</div></div>
                  <div className="rule"><div className="rule-num">03</div><div><b>ХЭРГИЙГ ХААХ</b> үйлдлийг нэг оролдлогод зөвхөн нэг удаа хийнэ.</div></div>
                  <div className="rule"><div className="rule-num">04</div><div>Нийт <b>3 оролдлого</b>. Оролдлого бүр өөр өгөгдөлтэй байна.</div></div>
                </div>

                <button className="primary" onClick={() => startAttempt(1)}>ХЭРЭГ НЭЭХ</button>
              </div>

              <aside className="intro-side">
                <div className="folder-tab">Case file</div>
                <div className="case-paper">
                  <div className="stamp">OPEN FOR REVIEW</div>
                  <h3>Customer Master Incident</h3>
                  <dl>
                    <dt>Даалгавар</dt>
                    <dd>Бодит чанарын асуудлуудыг илрүүлж, үндэслэлгүй сэжгийг ялгана.</dd>
                    <dt>Хаалтын дүрэм</dt>
                    <dd>Нэг оролдлого = нэг хаалт. Хаасны дараа засварлах боломжгүй.</dd>
                    <dt>Үр дүн</dt>
                    <dd>Илрүүлээгүй асуудал болон зөв өгөгдлийг буруу flag хийсэн тохиолдолд тус бүр бодит үр дагавар гарна.</dd>
                  </dl>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {stage === 'game' && (
        <section className="screen active">
          <div className="wrap">
            <div className="game-grid">
              <aside className="case-panel">
                <div className="folder-tab">Active case</div>
                <h2>Хэрэг №{currentCase.no}</h2>
                <div className="case-id">CUSTOMER MASTER INCIDENT</div>

                <div className="case-brief">
                  <b>Товч нөхцөл</b><br />
                  <span>{currentCase.brief}</span>
                </div>

                <div className="mini-label">Тэмдэглэсэн сэжүүр</div>
                <div className="flag-summary"><span>Нийт</span><b>{flagCount}</b></div>

                <div className="mini-label">Attempts</div>
                <div className="attempt-list">
                  {[1, 2, 3].map((i) => {
                    const cls = i < attempt ? 'done' : i === attempt ? 'current' : ''
                    const text = i < attempt ? `Attempt ${i} — ${scores[i - 1]} оноо` : i === attempt ? `Attempt ${i} — одоо` : `Attempt ${i} — боломжтой`
                    return <div key={i} className={cls}>{text}</div>
                  })}
                </div>

                <button className="close-btn" onClick={openCloseModal}>ХЭРГИЙГ ХААХ</button>
              </aside>

              <main className="workspace">
                <div className="workspace-head">
                  <strong>Investigation workspace</strong>
                  <div className="timer">{fmtTime(seconds)}</div>
                </div>

                <div className="tabs">
                  <button className={`tab${activeTab === 'master' ? ' active' : ''}`} onClick={() => setActiveTab('master')}>CUSTOMER MASTER</button>
                  <button className={`tab${activeTab === 'systems' ? ' active' : ''}`} onClick={() => setActiveTab('systems')}>SYSTEM CHECK</button>
                  <button className={`tab${activeTab === 'history' ? ' active' : ''}`} onClick={() => setActiveTab('history')}>HISTORY</button>
                </div>

                {activeTab === 'master' && (
                  <section className="tab-content active">
                    <div className="note">{currentCase.note}</div>
                    <div className="table-scroll">
                      <table className="data-table">
                        <thead>
                          <tr>{currentCase.headers.map((h) => <th key={h}>{h}</th>)}</tr>
                        </thead>
                        <tbody>
                          {currentCase.rows.map((row, ri) => (
                            <tr key={ri}>
                              {row.map((cell, ci) => {
                                const id = `m-${ri}-${ci}`
                                return (
                                  <td key={ci} className={`clickable${selected[id] ? ' flagged' : ''}`} onClick={() => toggleFlag(id)}>{cell}</td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {activeTab === 'systems' && (
                  <section className="tab-content active">
                    <div className="note">Ижил үзүүлэлтийн эх үүсвэрүүдийг харьцуул. Мөн баталгаажсан баримтыг тусад нь шалга.</div>
                    <div className="system-card">
                      <div className="hd">SYSTEM COMPARISON</div>
                      <div className="bd pair">
                        <div className={`metric clickable${selected['s-main'] ? ' flagged' : ''}`} onClick={() => toggleFlag('s-main')}>
                          <small>Source A</small><b>{currentCase.systemA}</b>
                        </div>
                        <div className={`metric clickable${selected['s-main'] ? ' flagged' : ''}`} onClick={() => toggleFlag('s-main')}>
                          <small>Source B</small><b>{currentCase.systemB}</b>
                        </div>
                      </div>
                    </div>
                    <div className="system-card">
                      <div className="hd">REFERENCE</div>
                      <div className="bd">
                        <div className={`metric clickable${selected['reference'] ? ' flagged' : ''}`} onClick={() => toggleFlag('reference')}>
                          <small>Баталгаажсан мэдээлэл</small><b>{currentCase.reference}</b>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {activeTab === 'history' && (
                  <section className="tab-content active">
                    <div className="note">{currentCase.policy}</div>
                    <div className="history">
                      {currentCase.history.map((x, i) => {
                        const id = `h-${i}`
                        return (
                          <div key={id} className={`history-item clickable${selected[id] ? ' flagged' : ''}`} onClick={() => toggleFlag(id)}>
                            <b>{x[0]}</b><span>{x[1]}</span>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}
              </main>

              <aside className="evidence-panel">
                <h3>Нотлох баримт</h3>
                <div className="sub">Flag бүрээ ангил. Хэргийг хаах хүртэл засварлаж болно.</div>
                <div className="evidence-list">
                  {flagCount === 0 ? (
                    <div className="empty">Одоогоор сэжүүр бүртгээгүй байна.</div>
                  ) : (
                    Object.entries(selected).map(([id, item], idx) => (
                      <div className="e-card" key={id}>
                        <div className="e-top">
                          <b>#{String(idx + 1).padStart(2, '0')} {item.title}</b>
                          <button className="remove" onClick={() => removeFlag(id)}>REMOVE</button>
                        </div>
                        <p>{item.desc}</p>
                        <select value={item.classification} onChange={(e) => setClassification(id, e.target.value)}>
                          <option value="">— Ангилал сонгох —</option>
                          {dimensions.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {stage === 'result' && result && (
        <section className="screen active">
          <div className="wrap">
            <div className="result-layout">
              <aside className="result-left">
                <div className="folder-tab">Case outcome</div>
                <h2>Хэрэг хаагдлаа</h2>

                <div className="score">{result.score}<span>/100</span></div>
                <div className="best">Best score: {Math.max(...result.scoresSnapshot.filter((x) => x !== undefined))}</div>

                <div className="result-stats">
                  <div className="result-stat"><span>Зөв илрүүлсэн</span><b>{result.tp} / {result.total}</b></div>
                  <div className="result-stat"><span>Илрүүлээгүй үлдээсэн</span><b>{result.miss}</b></div>
                  <div className="result-stat"><span>Үндэслэлгүй сэжиг</span><b>{result.fp}</b></div>
                  <div className="result-stat"><span>Зөв ангилсан</span><b>{result.classOk} / {result.total}</b></div>
                </div>

                <div className="score-history">
                  <b>Attempt history</b><br />
                  {[1, 2, 3].map((i, idx) => (
                    <span key={i}>Attempt {i}: {result.scoresSnapshot[i - 1] !== undefined ? result.scoresSnapshot[i - 1] + ' оноо' : '—'}{idx < 2 ? <br /> : null}</span>
                  ))}
                </div>
              </aside>

              <main className="result-main">
                <h3>Хаалтын дараах үр дагавар</h3>
                <div>
                  {result.outcomes.map((o, i) => (
                    <div className={`outcome${o.type === 'false' ? ' false' : o.type === 'good' ? ' good' : ''}`} key={i}>
                      <b>{o.title}</b>
                      <p>{o.text}</p>
                      <div className="chain">{o.chain}</div>
                    </div>
                  ))}
                </div>

                <div className="result-actions">
                  {attempt < 3 && (
                    <button className="primary" onClick={() => startAttempt(attempt + 1)}>ATTEMPT {attempt + 1} ЭХЛҮҮЛЭХ</button>
                  )}
                  <button className="secondary" onClick={backToIntro}>ЭХЛЭЛ РҮҮ</button>
                </div>
              </main>
            </div>
          </div>
        </section>
      )}

      {modalOpen && (
        <div className="modal show">
          <div className="modal-box">
            <h3>Хэргийг хаах уу?</h3>
            <p>
              Та одоогоор <b>{flagCount}</b> сэжүүр тэмдэглэсэн байна.
              Хэргийг хаасны дараа энэ оролдлогод дахин засвар хийх боломжгүй.
              Хаалт нэг удаа л хийгдэнэ.
            </p>
            <div className="modal-actions">
              <button className="secondary" onClick={() => setModalOpen(false)}>БУЦАХ</button>
              <button className="danger" onClick={closeCase}>ХЭРГИЙГ ХААХ</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dq-game {
          --ink:#1f2933; --navy:#243b53; --navy-dark:#1b2f42;
          --paper:#f7f4ec; --paper-2:#fffdf8; --line:#c9c1b3; --muted-dq:#6f766f;
          --red:#9d4139; --amber:#b07824; --green:#47624e; --blue:#446985; --desk:#ddd7cc;
          --safe-t:env(safe-area-inset-top,0px); --safe-b:env(safe-area-inset-bottom,0px);
          background:var(--desk); color:var(--ink); font-family:Arial, Helvetica, sans-serif;
          min-height:100vh; -webkit-text-size-adjust:100%;
        }
        .dq-game *{box-sizing:border-box}
        .dq-game button, .dq-game select{font:inherit}
        .dq-game button{cursor:pointer;touch-action:manipulation}
        .dq-game h1, .dq-game h2, .dq-game h3{font-family:Georgia,"Times New Roman",serif}

        .dq-game .topbar{height:60px;background:var(--navy-dark);color:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 22px;padding-top:var(--safe-t);border-bottom:4px solid #bca86c}
        .dq-game .brand{display:flex;align-items:center;gap:12px;text-decoration:none;color:#fff}
        .dq-game .brand-mark{width:34px;height:34px;border:1px solid rgba(255,255,255,.5);display:grid;place-items:center;font-size:12px;font-weight:700;letter-spacing:.08em}
        .dq-game .brand strong{font-size:14px;letter-spacing:.04em}
        .dq-game .brand small{display:block;color:#cbd5df;margin-top:2px}
        .dq-game .attempt-badge{border:1px solid rgba(255,255,255,.35);padding:7px 10px;font-size:12px;white-space:nowrap}

        .dq-game .screen{display:none}
        .dq-game .screen.active{display:block}
        .dq-game .wrap{max-width:1320px;margin:0 auto;padding:24px}

        .dq-game .intro{max-width:980px;margin:38px auto;display:grid;grid-template-columns:1.12fr .88fr;background:var(--paper-2);border:1px solid #b9b0a1;box-shadow:0 8px 22px rgba(44,46,48,.08)}
        .dq-game .intro-main{padding:44px 48px}
        .dq-game .eyebrow{color:var(--red);font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;margin-bottom:14px}
        .dq-game h1{margin:0 0 18px;font-size:50px;line-height:1.02;font-weight:600;color:#1d3447}
        .dq-game .intro-main p{color:#50585d;line-height:1.65;font-size:15px}
        .dq-game .rules{border-top:1px solid var(--line);margin:28px 0 30px}
        .dq-game .rule{display:grid;grid-template-columns:34px 1fr;gap:8px;padding:12px 0;border-bottom:1px solid var(--line);font-size:13px;line-height:1.45}
        .dq-game .rule-num{font-family:Georgia,serif;font-size:20px;color:var(--red)}
        .dq-game .primary{border:0;background:var(--navy);color:#fff;padding:14px 18px;font-weight:700;min-height:48px}
        .dq-game .primary:hover{background:#1f3347}
        .dq-game .intro-side{background:#e2dccf;border-left:1px solid #b9b0a1;padding:36px 30px}
        .dq-game .folder-tab{display:inline-block;background:#c7b58d;color:#463b26;padding:7px 11px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;margin-bottom:15px}
        .dq-game .case-paper{background:#faf7f0;border:1px solid #b6ad9f;padding:22px;transform:rotate(-.4deg);box-shadow:0 3px 0 rgba(0,0,0,.04)}
        .dq-game .stamp{display:inline-block;color:var(--red);border:2px solid var(--red);padding:4px 8px;font-size:10px;font-weight:700;letter-spacing:.13em;transform:rotate(-4deg);margin-bottom:18px}
        .dq-game .case-paper h3{font-size:24px;margin:0 0 16px;color:#233b50}
        .dq-game .case-paper dt{margin-top:14px;font-size:10px;color:#777;text-transform:uppercase;letter-spacing:.1em}
        .dq-game .case-paper dd{margin:4px 0 0;font-size:13px;line-height:1.45}

        .dq-game .game-grid{display:grid;grid-template-columns:250px minmax(0,1fr) 290px;background:var(--paper-2);border:1px solid #b9b0a1;min-height:700px;box-shadow:0 8px 22px rgba(44,46,48,.08)}
        .dq-game .case-panel{background:#e3ddd1;padding:19px;border-right:1px solid #b9b0a1}
        .dq-game .case-panel h2{margin:2px 0 4px;font-size:23px;color:#21384c}
        .dq-game .case-id{font-size:10px;letter-spacing:.09em;color:#6b6f6c;margin-bottom:17px}
        .dq-game .case-brief{border:1px solid #b7aea0;background:#f8f5ee;padding:14px;font-size:12px;line-height:1.5}
        .dq-game .case-brief b{color:var(--red)}
        .dq-game .mini-label{margin:19px 0 8px;color:#777;text-transform:uppercase;letter-spacing:.12em;font-size:9px}
        .dq-game .attempt-list{font-size:12px;line-height:1.8}
        .dq-game .attempt-list .current{font-weight:700;color:var(--red)}
        .dq-game .attempt-list .done{font-weight:700;color:var(--green)}
        .dq-game .flag-summary{display:flex;justify-content:space-between;font-size:11px;color:#5d6463;padding:8px 0;border-bottom:1px solid #c8bfb1}
        .dq-game .close-btn{width:100%;margin-top:18px;border:0;background:var(--red);color:#fff;padding:12px;font-weight:700;min-height:46px}

        .dq-game .workspace{min-width:0;background:#f9f7f2}
        .dq-game .workspace-head{display:flex;justify-content:space-between;align-items:center;padding:15px 17px;border-bottom:1px solid #c8bfb1;background:#f1ede4}
        .dq-game .workspace-head strong{font-family:Georgia,serif;font-size:19px}
        .dq-game .timer{font-family:"Courier New",monospace;border:1px solid #b6ad9f;background:#fff;padding:6px 9px;font-weight:700;font-size:13px}
        .dq-game .tabs{display:flex;background:#e9e4da;border-bottom:1px solid #b9b0a1;padding-left:12px;overflow-x:auto;-webkit-overflow-scrolling:touch}
        .dq-game .tab{border:0;border-right:1px solid #b9b0a1;background:transparent;padding:10px 13px;color:#555;font-size:11px;font-weight:700;white-space:nowrap;min-height:44px}
        .dq-game .tab.active{background:#fff;color:var(--navy);border-left:1px solid #b9b0a1;margin-bottom:-1px;border-bottom:1px solid #fff}
        .dq-game .tab-content{padding:18px}
        .dq-game .note{background:#fff8dc;border-left:4px solid #c3a04a;padding:10px 12px;margin-bottom:13px;font-size:11px;line-height:1.45;color:#514b3c}

        .dq-game .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #b8b0a2}
        .dq-game .data-table{width:100%;min-width:560px;border-collapse:collapse;background:#fff;font-size:11px}
        .dq-game .data-table th{background:#dde4e8;text-align:left;padding:9px 8px;border-right:1px solid #c3ccd1;border-bottom:1px solid #aeb8be;color:#263947;white-space:nowrap}
        .dq-game .data-table td{padding:9px 8px;border-right:1px solid #e0dbd2;border-bottom:1px solid #ddd7ce;position:relative;white-space:nowrap}
        .dq-game .data-table tr:nth-child(even) td{background:#fbfaf7}
        .dq-game .data-table th:first-child,.dq-game .data-table td:first-child{position:sticky;left:0;background:#fff;box-shadow:2px 0 4px rgba(0,0,0,.07)}
        .dq-game .data-table th:first-child{background:#dde4e8;z-index:2}
        .dq-game .data-table tr:nth-child(even) td:first-child{background:#fbfaf7}

        .dq-game .clickable{cursor:pointer}
        .dq-game .clickable:hover{outline:2px solid #7990a1;outline-offset:-2px}
        .dq-game .flagged{background:#fff1d5!important;box-shadow:inset 0 0 0 2px #b17a27}
        .dq-game .flagged::after{content:"FLAG";position:absolute;top:2px;right:3px;font-size:7px;font-weight:700;color:#7c5319;letter-spacing:.08em}

        .dq-game .system-card{border:1px solid #b9b0a1;background:#fff;margin-bottom:12px}
        .dq-game .system-card .hd{background:#e5eaed;border-bottom:1px solid #b9b0a1;padding:9px 10px;font-size:10px;font-weight:700;color:#2b4357;letter-spacing:.06em}
        .dq-game .system-card .bd{padding:12px}
        .dq-game .pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .dq-game .metric{background:#fbfaf7;border:1px solid #d3cdc2;padding:12px;position:relative}
        .dq-game .metric small{display:block;color:#777;margin-bottom:5px}
        .dq-game .metric b{font-family:Georgia,serif;font-size:16px}

        .dq-game .history{border-left:2px solid #98a6ae;margin-left:9px;padding-left:18px}
        .dq-game .history-item{margin:0 0 18px;position:relative;padding:3px 6px}
        .dq-game .history-item::before{content:"";width:8px;height:8px;border-radius:50%;background:#6e8798;position:absolute;left:-23px;top:7px}
        .dq-game .history-item b{display:block;font-size:11px;margin-bottom:3px}
        .dq-game .history-item span{font-size:11px;color:#656b6f}

        .dq-game .evidence-panel{background:#eee9df;border-left:1px solid #b9b0a1;padding:17px}
        .dq-game .evidence-panel h3{margin:0 0 4px;font-size:20px;color:#21384c}
        .dq-game .evidence-panel .sub{color:#777;font-size:10px;line-height:1.4;margin-bottom:13px}
        .dq-game .evidence-list{display:flex;flex-direction:column;gap:8px}
        .dq-game .e-card{background:#fff;border:1px solid #b9b0a1;padding:9px}
        .dq-game .e-top{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px}
        .dq-game .e-top b{font-size:10px}
        .dq-game .remove{border:0;background:none;padding:6px 0;color:var(--red);font-size:9px;font-weight:700}
        .dq-game .e-card p{margin:0 0 8px;color:#50575a;font-size:10px;line-height:1.35}
        .dq-game .e-card select{width:100%;background:#faf9f6;border:1px solid #b9b0a1;padding:8px 6px;font-size:11px;min-height:38px}
        .dq-game .empty{border:1px dashed #b9b0a1;padding:18px 10px;text-align:center;color:#777;font-size:10px;line-height:1.5}

        .dq-game .modal{position:fixed;inset:0;background:rgba(20,24,28,.55);display:none;align-items:center;justify-content:center;padding:20px;padding-bottom:calc(20px + var(--safe-b));z-index:30}
        .dq-game .modal.show{display:flex}
        .dq-game .modal-box{width:min(500px,100%);background:#f8f5ee;border:1px solid #8e877b;padding:23px;box-shadow:0 16px 40px rgba(0,0,0,.2)}
        .dq-game .modal-box h3{margin:0 0 10px;font-size:25px}
        .dq-game .modal-box p{margin:0;color:#555;font-size:13px;line-height:1.55}
        .dq-game .modal-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:19px}
        .dq-game .secondary{border:1px solid #9f978a;background:#fff;color:#333;padding:11px 13px;min-height:44px}
        .dq-game .danger{border:0;background:var(--red);color:#fff;padding:11px 13px;font-weight:700;min-height:44px}

        .dq-game .result-layout{max-width:1040px;margin:22px auto;display:grid;grid-template-columns:320px 1fr;background:var(--paper-2);border:1px solid #b9b0a1;box-shadow:0 8px 22px rgba(44,46,48,.08)}
        .dq-game .result-left{background:#e2dbce;border-right:1px solid #b9b0a1;padding:26px}
        .dq-game .result-left h2{margin:0 0 6px;font-size:29px}
        .dq-game .score{font-family:Georgia,serif;font-size:62px;color:var(--navy);line-height:1;margin:18px 0 5px}
        .dq-game .score span{font-size:18px;color:#68727a}
        .dq-game .best{font-size:11px;color:#555}
        .dq-game .result-stats{margin-top:20px;border-top:1px solid #b9b0a1}
        .dq-game .result-stat{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #c8bfb1;font-size:11px}
        .dq-game .score-history{margin-top:16px;font-size:11px;line-height:1.6;color:#555}
        .dq-game .result-main{padding:26px}
        .dq-game .result-main h3{margin:0 0 10px;font-size:22px}
        .dq-game .outcome{border-left:4px solid var(--red);background:#fff;padding:13px 14px;margin:10px 0}
        .dq-game .outcome.false{border-left-color:var(--amber)}
        .dq-game .outcome.good{border-left-color:var(--green)}
        .dq-game .outcome b{display:block;font-size:11px;margin-bottom:5px}
        .dq-game .outcome p{margin:0;color:#4f5659;font-size:12px;line-height:1.5}
        .dq-game .chain{margin-top:7px;color:#777;font-size:10px;font-family:"Courier New",monospace;word-break:break-word}
        .dq-game .result-actions{display:flex;gap:9px;margin-top:20px;flex-wrap:wrap}
        .dq-game .result-actions button{flex:1;min-width:160px}

        @media(max-width:1050px){
          .dq-game .game-grid{grid-template-columns:220px 1fr}
          .dq-game .evidence-panel{grid-column:1/-1;border-left:0;border-top:1px solid #b9b0a1}
          .dq-game .evidence-list{display:grid;grid-template-columns:repeat(3,1fr)}
        }

        @media(max-width:760px){
          .dq-game .wrap{padding:14px}
          .dq-game .intro{grid-template-columns:1fr;margin:16px auto}
          .dq-game .intro-main{padding:26px 22px}
          .dq-game .intro-side{border-left:0;border-top:1px solid #b9b0a1;padding:24px 22px}
          .dq-game h1{font-size:38px}
          .dq-game .game-grid{grid-template-columns:1fr;min-height:0}
          .dq-game .case-panel{border-right:0;border-bottom:1px solid #b9b0a1}
          .dq-game .workspace-head{position:sticky;top:0;z-index:5}
          .dq-game .evidence-list{grid-template-columns:1fr}
          .dq-game .result-layout{grid-template-columns:1fr}
          .dq-game .result-left{border-right:0;border-bottom:1px solid #b9b0a1}
          .dq-game .pair{grid-template-columns:1fr}
          .dq-game .topbar{padding:0 14px}
          .dq-game .brand strong{font-size:12px}
          .dq-game .brand small{font-size:10px}
          .dq-game .tab{padding:12px 12px}
          .dq-game .e-card select{font-size:14px}
        }

        @media(max-width:480px){
          .dq-game .attempt-badge{font-size:10px;padding:5px 8px}
          .dq-game .result-actions{flex-direction:column}
          .dq-game .result-actions button{width:100%}
        }
      `}</style>
    </div>
  )
}
