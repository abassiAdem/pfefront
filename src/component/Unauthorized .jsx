
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../Store/auth2Slice';
const Unauthorized = () => {
  const dispatch = useDispatch();
  useEffect(() => {

    dispatch(logoutUser());
  }, [dispatch]);
  return (
<div className="text-center p-5">
    <h1 className="text-xl font-bold mb-4">Accès Non Autorisé</h1>
    <p className="mb-4">Vous n'avez pas la permission d'accéder à cette page.</p>
    <Link to="/login" className="text-blue-500 hover:underline">
        Retour à l'accueil
    </Link>
</div>
  );
};

export default Unauthorized;