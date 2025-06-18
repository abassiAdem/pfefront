import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {useSaveEmailConfigMutation} from "../../Store/userSlice"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";
import { toast } from 'sonner';
export default function EmailConfiguation() {
  const [config, setConfig] = useState({
    smtpServer: '',
    port: '',
    username: '',
    password: '',
    encryption: 'tls',
    senderName: '',
    senderEmail: '',
    replyTo: '',
    testRecipient: ''
  });
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saveEmailConfig] = useSaveEmailConfigMutation()
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };
  
  const saveConfiguration = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const send = config.password === '' ? {...config, password: undefined} : config;
      
      await saveEmailConfig(send).unwrap();
      toast.success("Vos paramètres SMTP ont été enregistrés avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de la configuration");
      console.error("Save configuration error:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const sendTestEmail = () => {
    if (!config.testRecipient) {
      setMessage({ text: 'Please enter a test recipient email', type: 'error' });
      return;
    }
    
    setIsTesting(true);
    setMessage({ text: '', type: '' });
    
    setTimeout(() => {
      setIsTesting(false);
      setMessage({ 
        text: 'Test email sent successfully to ' + config.testRecipient, 
        type: 'success' 
      });
    }, 1500);
  };

  return (
<Card className="max-w-4xl w-[700px] mt-5 mx-auto">
  <CardHeader>
    <CardTitle>Configuration Email</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Paramètres SMTP</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="smtpServer">Serveur SMTP</Label>
            <Input
              id="smtpServer"
              name="smtpServer"
              required
              value={config.smtpServer}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              required
              name="port"
              value={config.port}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Email d'utilisateur</Label>
            <Input
              id="username"
              required
              type="email"
              name="username"
              value={config.username}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
            <Input
              id="password"
              required
              name="password"
              type={showPassword ? "text" : "password"}
              value={config.password}
              onChange={handleChange}
            />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
              <button type="button" className="text-amber-500 hover:text-amber-600" onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="encryption">Chiffrement</Label>
            <Select
              name="encryption"
              required
              value={config.encryption}
              onValueChange={(value) => setConfig(prev => ({ ...prev, encryption: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le chiffrement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="tls">TLS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Détails de l'email</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="senderName">Nom de l'expéditeur</Label>
            <Input
              id="senderName"
              name="senderName"
              value={config.senderName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senderEmail">Email de l'expéditeur</Label>
            <Input
              id="senderEmail"
              type="email"
              name="senderEmail"
              value={config.senderEmail}
              onChange={handleChange}
            />
          </div>

        </div>
      </div>
      

      
      {message.text && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end">
        <Button
          onClick={saveConfiguration}
          className="text-white bg-blue-700 hover:bg-blue-800"
          disabled={isSaving}
        >
          {isSaving ? 'Sauvegarde...' : 'Enregistrer la configuration'}
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
  );
}


/*      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Test de configuration</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow space-y-2 w-full">
            <Label htmlFor="testRecipient">Email du destinataire de test</Label>
            <Input
              id="testRecipient"
              type="email"
              name="testRecipient"
              value={config.testRecipient}
              onChange={handleChange}
              placeholder="Entrez l'email pour recevoir le test"
            />
          </div>
          <Button
            onClick={sendTestEmail}
            className="text-white bg-blue-500 hover:bg-blue-600"
            disabled={isTesting}
          >
            {isTesting ? 'Envoi en cours...' : 'Envoyer un email test'}
          </Button>
        </div>
      </div> */