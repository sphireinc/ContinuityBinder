import { useEffect, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type FieldProps = { label: string; helpText?: string; error?: string; id?: string };
type InputFieldProps = FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>;
type SelectFieldProps = FieldProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> & { options: Array<{ value: string; label: string }> };
const fieldId = (label: string, id?: string) => id ?? label.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-');
function FieldMessage({ id, helpText, error }: Pick<FieldProps, 'helpText' | 'error'> & { id: string }) { return <>{error ? <p id={`${id}-error`} role="alert">{error}</p> : helpText ? <p id={`${id}-help`}>{helpText}</p> : null}</>; }

export function TextField({ label, helpText, error, id, ...props }: InputFieldProps) { const inputId = fieldId(label, id); return <div><label htmlFor={inputId}>{label}</label><input id={inputId} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined} {...props} /><FieldMessage id={inputId} helpText={helpText} error={error} /></div>; }
export function PhoneField(props: InputFieldProps) { return <TextField type="tel" autoComplete="tel" {...props} />; }
export function EmailField(props: InputFieldProps) { return <TextField type="email" autoComplete="email" {...props} />; }
export function DateField(props: InputFieldProps) { return <TextField type="date" {...props} />; }
export function CurrencyField(props: InputFieldProps) { return <TextField inputMode="decimal" {...props} />; }
export function IdentifierField({ label, displayPolicy = 'full', ...props }: InputFieldProps & { displayPolicy?: 'full' | 'last4' | 'hidden' }) { return <div><TextField label={label} {...props} /><SelectField label={`${label} display policy`} value={displayPolicy} onChange={() => undefined} options={[{ value: 'full', label: 'Full' }, { value: 'last4', label: 'Last four only' }, { value: 'hidden', label: 'Do not print' }]} /></div>; }
export function TextArea({ label, helpText, error, id, ...props }: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>) { const inputId = fieldId(label, id); return <div><label htmlFor={inputId}>{label}</label><textarea id={inputId} aria-invalid={Boolean(error)} {...props} /><FieldMessage id={inputId} helpText={helpText} error={error} /></div>; }
export function NotesField(props: FieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>) { return <TextArea {...props} />; }
export function SelectField({ label, options, helpText, error, id, ...props }: SelectFieldProps) { const selectId = fieldId(label, id); return <div><label htmlFor={selectId}>{label}</label><select id={selectId} aria-invalid={Boolean(error)} {...props}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><FieldMessage id={selectId} helpText={helpText} error={error} /></div>; }
export function SectionCard({ title, children }: { title: string; children: ReactNode }) { return <section className="section-card"><h2>{title}</h2>{children}</section>; }
export function FormActions({ children }: { children: ReactNode }) { return <div className="form-actions">{children}</div>; }
export function InlineValidation({ message }: { message?: string }) { return message ? <p role="alert">{message}</p> : null; }
export function DestructiveAction({ label, confirmMessage, onConfirm }: { label: string; confirmMessage: string; onConfirm: () => void }) { return <button type="button" className="destructive-action" onClick={() => { if (window.confirm(confirmMessage)) onConfirm(); }}>{label}</button>; }
export function Picker({ label, options, onAddNew }: { label: string; options: Array<{ value: string; label: string }>; onAddNew?: () => void }) { return <div><SelectField label={label} options={options} /><button type="button" onClick={onAddNew}>Add new</button></div>; }
export const AddressPicker = Picker;
export const PersonPicker = Picker;
export const ContactPicker = Picker;
export const OrganizationPicker = Picker;
export const DocumentLocationPicker = Picker;
export const MoneyAccountPicker = Picker;
export const MultiReferencePicker = Picker;
export function RepeatingFieldArray<T>({ values, renderItem, onChange, createItem }: { values: T[]; renderItem: (value: T, index: number) => ReactNode; onChange: (values: T[]) => void; createItem: () => T }) { return <div>{values.map((value, index) => <div key={index}>{renderItem(value, index)}<button type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}<button type="button" onClick={() => onChange([...values, createItem()])}>Add another</button></div>; }

export function useAutosave<T>(value: T, save: (value: T) => Promise<void>, delay = 500) { const [status, setStatus] = useState<'saved' | 'saving' | 'error'>('saved'); useEffect(() => { let cancelled = false; setStatus('saving'); const timer = window.setTimeout(() => { void save(value).catch(() => save(value)).then(() => { if (!cancelled) setStatus('saved'); }).catch(() => { if (!cancelled) setStatus('error'); }); }, delay); return () => { cancelled = true; window.clearTimeout(timer); }; }, [value, save, delay]); return status; }
