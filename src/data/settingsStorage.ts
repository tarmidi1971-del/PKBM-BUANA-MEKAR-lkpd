import { InstitutionSettings, AppSecuritySettings } from '../types';
import { INITIAL_SUBJECT_TEACHERS, loadSubjectTeachers, saveSubjectTeachers } from './teacherDirectory';

export const DEFAULT_INSTITUTION_SETTINGS: InstitutionSettings = {
  name: 'PKBM Buana Mekar',
  shortName: 'BM',
  npsn: 'P9908123',
  address: 'Jl. Raya Pendidikan No. 45, Bandung, Jawa Barat',
  phone: '',
  email: 'info@pkbmbuanamekar.sch.id',
  headName: 'Drs. H. Yohanes Tarmidi, M.Pd.',
  headNipOrNiy: '19750819 200501 1 004',
  defaultTutor: 'Tim Pengampu PKBM',
  academicYear: '2026/2027',
  city: 'Bandung',
  tagline: 'Pusat Kegiatan Belajar Masyarakat & Homeschooling Terpadu',
  themeColor: 'blue',
  website: 'www.pkbmbuanamekar.sch.id',
  subjectTeachers: INITIAL_SUBJECT_TEACHERS
};

export const DEFAULT_SECURITY_SETTINGS: AppSecuritySettings = {
  isProtectionEnabled: true,
  adminPin: '123456',
  securityQuestion: 'Apa nama lembaga pendidikan kesetaraan ini?',
  securityAnswer: 'Buana Mekar',
  protectTutorMode: true,
  protectInstitutionSettings: true,
  protectAIGenerator: true,
  protectCurriculumEdit: true,
  isAppLocked: false
};

const INSTITUTION_STORAGE_KEY = 'pkbm_institution_profile_v2';
const SECURITY_STORAGE_KEY = 'pkbm_security_settings_v2';

export const loadInstitutionSettings = (): InstitutionSettings => {
  if (typeof window === 'undefined') return DEFAULT_INSTITUTION_SETTINGS;
  try {
    const data = localStorage.getItem(INSTITUTION_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.phone === '0857-2227-1680' || parsed.phone === '085722271680') {
        parsed.phone = '';
        localStorage.setItem(INSTITUTION_STORAGE_KEY, JSON.stringify(parsed));
      }
      return { ...DEFAULT_INSTITUTION_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Error loading institution settings', e);
  }
  return DEFAULT_INSTITUTION_SETTINGS;
};

export const saveInstitutionSettings = (settings: InstitutionSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(INSTITUTION_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('pkbm_institution_settings_changed', { detail: settings }));
    if (settings.subjectTeachers) {
      window.dispatchEvent(new CustomEvent('pkbm_subject_teachers_changed', { detail: settings.subjectTeachers }));
    }
  } catch (e) {
    console.error('Error saving institution settings', e);
  }
};

export const loadSecuritySettings = (): AppSecuritySettings => {
  if (typeof window === 'undefined') return DEFAULT_SECURITY_SETTINGS;
  try {
    const data = localStorage.getItem(SECURITY_STORAGE_KEY);
    if (data) {
      return { ...DEFAULT_SECURITY_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Error loading security settings', e);
  }
  return DEFAULT_SECURITY_SETTINGS;
};

export const saveSecuritySettings = (settings: AppSecuritySettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SECURITY_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving security settings', e);
  }
};
