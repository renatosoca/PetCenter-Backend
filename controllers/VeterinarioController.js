

const registrar = (req, res) => {
    res.json({ url : 'Desde el registrar Veterinario'});
};

const perfil = (req, res) => {
    res.json({ url : 'Desde el perfil Veterinario'});
};

export {
    registrar,
    perfil
};