import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createEncryptedRepository, type ContinuityDatabase } from '../../data/repositories/encryptedRepository';
import { contactSchema } from '../contacts/PeopleContacts';

type Mode = 'start' | 'first72' | 'doNot' | 'notify';
type ItemKey = 'locateDocuments' | 'contactExecutor' | 'certificates' | 'employer' | 'insurance' | 'secureProperty' | 'payments' | 'preserveAccess' | 'doNotDestroy' | 'doNotClose' | 'doNotPay' | 'doNotDistribute' | 'doNotCancel' | 'doNotPublish';
type Contact = { id: string; displayName: string; role: string; phone?: string; email?: string; notes?: string; priority?: string; purpose?: string; caller?: string };
const startItems: ItemKey[] = ['locateDocuments', 'contactExecutor', 'certificates', 'employer', 'insurance', 'secureProperty', 'payments', 'preserveAccess'];
const cautionItems: ItemKey[] = ['doNotDestroy', 'doNotClose', 'doNotPay', 'doNotDistribute', 'doNotCancel', 'doNotPublish'];

export function ImmediateResponse({ mode, database, dek }: { mode: Mode; database?: ContinuityDatabase | null; dek?: CryptoKey }) {
  const { t } = useTranslation('sections');
  const [items, setItems] = useState<ItemKey[]>(mode === 'doNot' ? cautionItems : startItems);
  const [checked, setChecked] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [customItem, setCustomItem] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  useEffect(() => { if (!database || !dek || mode !== 'notify') return; void createEncryptedRepository(database, dek, 'Contact', contactSchema).list().then((records) => setContacts(records as Contact[])); }, [database, dek, mode]);
  const titleKey = mode === 'start' ? 'startTitle' : mode === 'first72' ? 'first72Title' : mode === 'doNot' ? 'doNotTitle' : 'notifyTitle';
  const introKey = mode === 'start' ? 'startIntro' : mode === 'first72' ? 'first72Intro' : mode === 'doNot' ? 'doNotIntro' : 'notifyIntro';
  if (mode === 'notify') return <section className="section-page"><p className="eyebrow">{t(titleKey)}</p><h2>{t(titleKey)}</h2><p>{t(introKey)}</p><div className="table-wrap"><table className="notify-table"><thead><tr><th>{t('priority')}</th><th>{t('personOrganization')}</th><th>{t('purpose')}</th><th>{t('caller')}</th><th>{t('phone')}</th><th>{t('email')}</th><th>{t('contactNotes')}</th></tr></thead><tbody>{contacts.length === 0 ? <tr><td colSpan={7}>{t('noContacts')} <Link to="../people-contacts">{t('openContacts')}</Link></td></tr> : contacts.map((contact) => <tr key={contact.id}><td>{contact.priority ?? ''}</td><td>{contact.displayName}</td><td>{contact.purpose ?? t('purpose')}</td><td>{contact.caller ?? ''}</td><td>{contact.phone ?? ''}</td><td>{contact.email ?? ''}</td><td>{contact.notes ?? ''}</td></tr>)}</tbody></table></div></section>;
  return <section className="section-page"><p className="eyebrow">{t(titleKey)}</p><h2>{t(titleKey)}</h2><p>{t(introKey)}</p><div className="checklist">{items.map((key, index) => <article className="checklist-item" key={`${key}-${index}`}><label><input type="checkbox" checked={checked.includes(key)} onChange={() => setChecked((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key])} /> {t(`items.${key}`)}</label>{mode === 'first72' && <><textarea aria-label={`${t('notes')}: ${t(`items.${key}`)}`} placeholder={t('notes')} value={notes[key] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [key]: event.target.value }))} /><div className="item-actions"><button type="button" onClick={() => index > 0 && setItems((current) => { const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}>{t('moveUp')}</button><button type="button" onClick={() => index < items.length - 1 && setItems((current) => { const next = [...current]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; return next; })}>{t('moveDown')}</button><button type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>{t('remove')}</button></div></>}</article>)}</div>{mode === 'first72' && <form onSubmit={(event) => { event.preventDefault(); if (customItem.trim()) { setItems((current) => [...current, customItem.trim() as ItemKey]); setCustomItem(''); } }}><label>{t('newItem')}<input value={customItem} onChange={(event) => setCustomItem(event.target.value)} /></label><button type="submit">{t('addItem')}</button></form>}<button type="button" className="button button-primary" onClick={() => window.localStorage.setItem(`continuity-binder-${mode}-notes`, JSON.stringify(notes))}>{t('save')}</button></section>;
}
