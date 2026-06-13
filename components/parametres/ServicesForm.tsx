// components/parametres/ServicesForm.tsx
'use client'

import { useState } from 'react'
import { useServices, useCreateService, useUpdateService, useDeleteService } from '@/lib/queries/services'
import { useHotelStore } from '@/store/hotel-store'
import { NativeInput } from '@/components/common/ui'
import { ApiError } from '@/lib/api/client'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { formatAmount } from '@/lib/utils/format'
import toast from 'react-hot-toast'
import type { Service } from '@/types/hotel'

const emptyForm = { name: '', price: '' }

export function ServicesForm() {
  const locale = useHotelStore((s) => s.locale)
  const { data: services = [], isLoading } = useServices()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const deleteService = useDeleteService()

  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; price: string }>(emptyForm)
  const [newForm, setNewForm] = useState<{ name: string; price: string }>(emptyForm)
  const [showCreate, setShowCreate] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const startEdit = (s: Service) => {
    setEditId(s.id)
    setEditForm({ name: s.name, price: String(s.unitPrice) })
    setShowCreate(false)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditForm(emptyForm)
  }

  const handleSave = async (id: string) => {
    const price = parseFloat(editForm.price)
    if (!editForm.name.trim() || isNaN(price)) return
    try {
      await updateService.mutateAsync({ id, name: editForm.name.trim(), price })
      setEditId(null)
      toast.success(locale === 'fr' ? 'Service mis à jour' : 'Service updated')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur' : 'Error')
      toast.error(msg)
    }
  }

  const handleCreate = async () => {
    const price = parseFloat(newForm.price)
    if (!newForm.name.trim() || isNaN(price)) return
    try {
      await createService.mutateAsync({ name: newForm.name.trim(), price })
      setNewForm(emptyForm)
      setShowCreate(false)
      toast.success(locale === 'fr' ? 'Service créé' : 'Service created')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur' : 'Error')
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteService.mutateAsync(id)
      setConfirmDeleteId(null)
      toast.success(locale === 'fr' ? 'Service supprimé' : 'Service deleted')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : err instanceof Error ? err.message : (locale === 'fr' ? 'Erreur' : 'Error')
      toast.error(msg)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px',
    border: '1px solid #EDE8DF',
    borderRadius: 8,
    fontSize: 13,
    color: '#3D1F0F',
    background: '#FAF7F2',
    outline: 'none',
    width: '100%',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 20, fontWeight: 500, color: '#3D1F0F' }}>
          {locale === 'fr' ? 'Services hôteliers' : 'Hotel services'}
        </h3>
        <button
          onClick={() => { setShowCreate(true); setEditId(null) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px',
            background: '#B5924C', color: '#FFF',
            border: 'none', borderRadius: 8,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={13} strokeWidth={2} />
          {locale === 'fr' ? 'Nouveau service' : 'New service'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div style={{
          background: '#FAF7F2', border: '1px solid #B5924C', borderRadius: 12,
          padding: '14px 16px', marginBottom: 16,
          display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 10, alignItems: 'end',
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, marginBottom: 4 }}>
              {locale === 'fr' ? 'Nom du service' : 'Service name'}
            </div>
            <input
              style={inputStyle}
              placeholder={locale === 'fr' ? 'Ex: Petit-déjeuner' : 'E.g. Breakfast'}
              value={newForm.name}
              onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, marginBottom: 4 }}>
              {locale === 'fr' ? 'Prix (FCFA)' : 'Price (FCFA)'}
            </div>
            <input
              style={inputStyle}
              type="number"
              min={0}
              placeholder="0"
              value={newForm.price}
              onChange={(e) => setNewForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleCreate}
              disabled={createService.isPending}
              style={{
                padding: '7px 14px', background: '#B5924C', color: '#FFF',
                border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <Check size={13} />
              {locale === 'fr' ? 'Créer' : 'Create'}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewForm(emptyForm) }}
              style={{
                padding: '7px 10px', background: 'transparent', color: '#5C6068',
                border: '1px solid #EDE8DF', borderRadius: 8, fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Service list */}
      {isLoading ? (
        <div style={{ color: '#5C6068', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
          {locale === 'fr' ? 'Chargement…' : 'Loading…'}
        </div>
      ) : services.length === 0 ? (
        <div style={{ color: '#5C6068', fontSize: 13, padding: '20px 0', textAlign: 'center' }}>
          {locale === 'fr' ? 'Aucun service configuré.' : 'No services configured.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {services.map((s) => (
            <div
              key={s.id}
              style={{
                background: editId === s.id ? '#FAF7F2' : '#FDFCFA',
                border: `1px solid ${editId === s.id ? '#B5924C' : '#EDE8DF'}`,
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              {editId === s.id ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px auto', gap: 10, alignItems: 'end' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, marginBottom: 4 }}>
                      {locale === 'fr' ? 'Nom' : 'Name'}
                    </div>
                    <input
                      style={inputStyle}
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#5C6068', fontWeight: 600, marginBottom: 4 }}>
                      {locale === 'fr' ? 'Prix (FCFA)' : 'Price (FCFA)'}
                    </div>
                    <input
                      style={inputStyle}
                      type="number"
                      min={0}
                      value={editForm.price}
                      onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleSave(s.id)}
                      disabled={updateService.isPending}
                      style={{
                        padding: '7px 14px', background: '#B5924C', color: '#FFF',
                        border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      <Check size={13} />
                      {locale === 'fr' ? 'Enreg.' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      style={{
                        padding: '7px 10px', background: 'transparent', color: '#5C6068',
                        border: '1px solid #EDE8DF', borderRadius: 8, fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3D1F0F' }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#B5924C', marginTop: 2 }}>
                      {formatAmount(s.unitPrice, 'FCFA')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {confirmDeleteId === s.id ? (
                      <>
                        <span style={{ fontSize: 12, color: '#5C6068', alignSelf: 'center', marginRight: 4 }}>
                          {locale === 'fr' ? 'Confirmer ?' : 'Confirm?'}
                        </span>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={deleteService.isPending}
                          style={{
                            padding: '5px 12px', background: '#C0392B', color: '#FFF',
                            border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          {locale === 'fr' ? 'Supprimer' : 'Delete'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{
                            padding: '5px 8px', background: 'transparent', color: '#5C6068',
                            border: '1px solid #EDE8DF', borderRadius: 7, fontSize: 12, cursor: 'pointer',
                          }}
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(s)}
                          style={{
                            padding: '5px 8px', background: 'transparent', color: '#5C6068',
                            border: '1px solid #EDE8DF', borderRadius: 7, cursor: 'pointer',
                          }}
                        >
                          <Pencil size={12} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(s.id)}
                          style={{
                            padding: '5px 8px', background: 'transparent', color: '#C0392B',
                            border: '1px solid #FADBD8', borderRadius: 7, cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={12} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
