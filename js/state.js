// ═══════════════════════════════════════
// SINGLE SHARED STATE
// ═══════════════════════════════════════
const S = {
  currentMonth: '2026.04',
  pendingDelete: null,

  persons: ['남현정','진영옥','정희진','정혜라','신선경','김혜원','방지영','길복주','김민혁'],

  weekendPersons: ['백홍석','박희석','김신영','진수연','정혜라','신선경','정희진','방지영','김혜원','남현정','진영옥','길복주','김민혁'],

  // 주말 근무 예외 인원 (Set)
  weekendExempt: new Set(['남현정','진영옥','길복주','김민혁']),

  monthly: {
    '2026.04': {
      '남현정':{vacation:2,overtime:0,weekend:0,note:'휴가 3/30,31'},
      '진영옥':{vacation:2,overtime:0,weekend:0,note:'휴가 3/30,31'},
      '정혜라':{vacation:0,overtime:0,weekend:0,note:''},
      '정희진':{vacation:0,overtime:0,weekend:0,note:''},
      '신선경':{vacation:2.25,overtime:0,weekend:0,note:'반반차 3/27, 휴가 3/30,31'},
      '김혜원':{vacation:2,overtime:0,weekend:0,note:'휴가 3/30,31'},
      '방지영':{vacation:2.25,overtime:0,weekend:0,note:'휴가 3/30,31 / 4/8 반반차'},
      '길복주':{vacation:0,overtime:0,weekend:0,note:''},
      '김민혁':{vacation:0,overtime:0,weekend:0,note:''},
    },
    '2026.03': {
      '남현정':{vacation:0,overtime:0,weekend:0,note:''},
      '진영옥':{vacation:0,overtime:0,weekend:0,note:''},
      '정혜라':{vacation:0,overtime:0,weekend:0,note:''},
      '정희진':{vacation:1,overtime:0,weekend:0,note:'3/20 연차'},
      '신선경':{vacation:0,overtime:0,weekend:0,note:''},
      '김혜원':{vacation:1,overtime:0,weekend:0,note:'3/18 개인연차'},
      '방지영':{vacation:0.5,overtime:0,weekend:0,note:'3/13 반차'},
      '길복주':{vacation:0,overtime:0,weekend:0,note:''},
      '김민혁':{vacation:0,overtime:0,weekend:0,note:''},
    },
    '2026.02': {
      '남현정':{vacation:1,overtime:0,weekend:0,note:'2/6반차, 2/12반차'},
      '진영옥':{vacation:0.25,overtime:0,weekend:0,note:'2/26 반반차'},
      '정혜라':{vacation:2,overtime:0,weekend:0,note:'2/19,20 개인휴가'},
      '정희진':{vacation:3,overtime:0,weekend:0,note:'2/2, 19,20 연차'},
      '신선경':{vacation:0.5,overtime:0,weekend:0,note:'2/6 오후반차'},
      '김혜원':{vacation:1.5,overtime:0,weekend:0,note:'1/27 오전반차'},
      '방지영':{vacation:1.25,overtime:0,weekend:0,note:'2/6 반반차, 2/19 개인휴가'},
      '길복주':{vacation:0,overtime:0,weekend:0,note:''},
      '김민혁':{vacation:0,overtime:0,weekend:0,note:''},
    },
    '2026.01': {
      '남현정':{vacation:0,overtime:0,weekend:0,note:''},
      '진영옥':{vacation:0,overtime:0,weekend:0,note:''},
      '정혜라':{vacation:0,overtime:0,weekend:0,note:''},
      '정희진':{vacation:0,overtime:0,weekend:0,note:''},
      '신선경':{vacation:0,overtime:0,weekend:0,note:''},
      '김혜원':{vacation:0,overtime:0,weekend:0,note:''},
      '방지영':{vacation:0.5,overtime:0,weekend:0,note:'1/15 반차'},
      '길복주':{vacation:0,overtime:0,weekend:0,note:''},
      '김민혁':{vacation:0,overtime:0,weekend:0,note:''},
    },
  },

  annualByYear: {
    '2026': {
      '남현정':{1:0,2:1,3:0,4:2,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
      '진영옥':{1:0,2:0.25,3:0,4:2,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
      '정희진':{1:0,2:3,3:1,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
      '정혜라':{1:0,2:2,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
      '신선경':{1:0,2:0.5,3:0,4:2.25,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
      '김혜원':{1:0,2:1.5,3:1,4:2,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
      '방지영':{1:0.5,2:1.25,3:0.5,4:2.25,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
      '길복주':{1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
      '김민혁':{1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0},
    },
  },

  annual2025: {
    '남현정':8.25,'진영옥':10.75,'정혜라':9.75,'정희진':3,
    '신선경':3.75,'김혜원':0.5,'방지영':1,'길복주':10,'김민혁':11,
  },

  weekend: {
    '백홍석':{dates:{'2026-01-03':'종일','2026-01-07':'종일','2026-02-07':'종일','2026-02-08':'종일','2026-02-21':'종일','2026-03-08':'종일','2026-03-15':'종일','2026-03-21':'종일','2026-03-28':'종일','2026-03-30':'종일','2026-03-31':'종일'}},
    '박희석':{dates:{'2026-01-03':'종일','2026-01-07':'종일','2026-02-07':'종일','2026-02-15':'종일','2026-03-07':'종일','2026-03-28':'종일'}},
    '김신영':{dates:{'2026-01-02':'반일','2026-01-17':'종일','2026-02-08':'종일','2026-02-14':'종일','2026-03-08':'종일','2026-03-21':'종일','2026-03-31':'종일'}},
    '진수연':{dates:{'2026-01-03':'종일','2026-01-17':'반일','2026-01-24':'반일','2026-02-02':'종일','2026-02-22':'종일','2026-03-01':'반일','2026-03-21':'반일','2026-03-25':'반일','2026-03-27':'반일','2026-03-31':'종일'}},
    '정혜라':{dates:{'2026-01-17':'종일','2026-02-02':'종일','2026-02-22':'종일','2026-03-27':'종일','2026-03-28':'종일'}},
    '신선경':{dates:{'2026-01-25':'종일','2026-02-02':'종일','2026-02-22':'종일','2026-03-08':'종일'}},
    '정희진':{dates:{'2026-01-04':'종일','2026-01-25':'종일','2026-02-02':'종일','2026-03-27':'종일','2026-03-28':'종일'}},
    '방지영':{dates:{'2026-01-04':'종일','2026-01-25':'종일','2026-02-02':'종일','2026-02-22':'종일','2026-03-22':'종일'}},
    '김혜원':{dates:{'2026-01-04':'종일','2026-01-24':'종일','2026-02-02':'종일','2026-02-22':'종일','2026-03-08':'종일'}},
    '남현정':{dates:{}},'진영옥':{dates:{}},'길복주':{dates:{}},'김민혁':{dates:{}},
  },

  weekendDates: [
    '2026-01-01','2026-01-02','2026-01-03','2026-01-04',
    '2026-01-17','2026-01-18','2026-01-24','2026-01-25','2026-01-31',
    '2026-02-02','2026-02-07','2026-02-08','2026-02-14','2026-02-15',
    '2026-02-21','2026-02-22','2026-02-28',
    '2026-03-01','2026-03-07','2026-03-08','2026-03-14','2026-03-15',
    '2026-03-21','2026-03-22','2026-03-28','2026-03-29','2026-03-30','2026-03-31'
  ],

  monthKeys: ['2026.01','2026.02','2026.03','2026.04'],
  monthLabels: {'2026.01':'2026년 1월','2026.02':'2026년 2월','2026.03':'2026년 3월','2026.04':'2026년 4월'},

  // 모든 직원 (중복 제거 순서 유지)
  get allPersons() {
    const all = [...this.persons];
    // weekend 전용 인원 추가 (persons 에 없는 경우)
    Object.keys(this.weekend).forEach(n => { if (!all.includes(n)) all.push(n); });
    return all;
  },

  getM(mk, name) {
    if (!this.monthly[mk]) this.monthly[mk] = {};
    if (!this.monthly[mk][name]) this.monthly[mk][name] = {vacation:0,overtime:0,weekend:0,note:''};
    return this.monthly[mk][name];
  },
  getW(name) {
    if (!this.weekend[name]) this.weekend[name] = {dates:{}};
    return this.weekend[name];
  },
  getA(year, name) {
    if (!this.annualByYear[year]) this.annualByYear[year] = {};
    if (!this.annualByYear[year][name]) this.annualByYear[year][name]={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0};
    return this.annualByYear[year][name];
  },
  wkCount(name) {
    return Object.values(this.getW(name).dates).reduce((s,v)=>s+(v==='종일'?1:v==='반일'?0.5:0),0);
  },
  wkRate(name) { return this.wkCount(name) / 24; },
  isExempt(name) { return this.weekendExempt.has(name); },
  toggleExempt(name) {
    if (this.weekendExempt.has(name)) this.weekendExempt.delete(name);
    else this.weekendExempt.add(name);
  },

  addPerson(name, note, v25) {
    if (this.allPersons.includes(name)) return false;
    this.persons.push(name);
    this.annual2025[name] = v25 || 0;
    this.weekend[name] = {dates:{}};
    this.monthKeys.forEach(mk => this.getM(mk, name));
    [...new Set(this.monthKeys.map(mk => mk.split('.')[0]))].forEach(year => this.getA(year, name));
    if (note) this.getM(this.currentMonth, name).note = note;
    return true;
  },

  removePerson(name) {
    this.persons = this.persons.filter(n=>n!==name);
    delete this.weekend[name];
    Object.keys(this.annualByYear).forEach(year => {
      if (this.annualByYear[year]) delete this.annualByYear[year][name];
    });
    delete this.annual2025[name];
    this.weekendExempt.delete(name);
    this.monthKeys.forEach(mk => { if(this.monthly[mk]) delete this.monthly[mk][name]; });
  },
};
