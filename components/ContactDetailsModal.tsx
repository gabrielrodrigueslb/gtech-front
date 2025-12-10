import { Contact, getContactById } from '@/lib/contact';
import { useEffect, useState } from 'react';

type Props = { contactId: String; onClose: ()=> void };



export default function ContactDetails({ contactId, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    if(!contactId) return
    loadContacts();
  }, [contactId]);

  async function loadContacts() {
    setIsLoading(true);
    try {
      const id =
        typeof contactId === 'string' ? contactId : contactId.valueOf();
      const data = await getContactById(id);
      setContact(data || []);
    } catch (error) {
      console.error('Erro ao carregar o contato:', error);
    } finally {
      setIsLoading(false);
    }
  }
if (!contact && isLoading) return <div className="modal-overlay"><div className="modal">Carregando...</div></div>;
  if (!contact) return null;
  return <>
  <div
          className="modal-overlay"
        >
          <div className="modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <button
                className="text-muted-foreground hover:text-foreground transition-colors text-2xl select-none cursor-pointer"
                onClick={onClose}
              >
                ✕
              </button>
            <h2 className="text-xl font-bold mb-4">Detalhes do Contato</h2>
            {contact && (
              <>
                <p>{contact.name}</p>
                <p>{contact.email}</p>
                <p>{contact.phone}</p>
                <p>{contact.segment}</p>
              </>
            )}

            
          </div>
        </div></>;
}
