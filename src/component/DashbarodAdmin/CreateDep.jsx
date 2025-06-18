import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useCreateDepartementMutation } from '../../Store/userSlice';
import { useState } from 'react';
import { Building } from 'lucide-react';
import { toast } from "sonner"
export default function CreateDep() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [open, setOpen] = useState(false);
  const [createDepartement] = useCreateDepartementMutation();

  const onSubmit = async (data) => {
    try {
      await createDepartement(data).unwrap();
      reset();
      toast.success("Succès", {
              description: "Le departement a été créé avec succès.",
            })
      setOpen(false);
    } catch (err) {
      console.error('Error creating departement:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          <Building className="mr-2 h-4 w-4" />
          Ajouter un Département
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau département</DialogTitle>
          <DialogDescription>
            Entrez le nom du département ci-dessous.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom du département</Label>
            <Input
              id="name"
              placeholder="Nom"
              {...register('name', { required: 'Le nom est requis' })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Ajouter</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}