import Paciente from "../models/Paciente.js";

const agregarPaciente = async (req, res) => {
    const paciente = new Paciente( req.body );
    paciente.veterinario = req.veterinario._id
    
    try {
        const pacienteInsert = await paciente.save();
        res.json( pacienteInsert )
    } catch (error) {
        const e = new Error('Ocurrio un Problema con el Sistema');
        res.status(400).json( { msg: e.message } );
    };
};

const obtenerPacientes = async (req, res) => {
    const pacientes = await Paciente.find().where( 'veterinario').equals( req.veterinario );
    res.json( pacientes )
};

const obtenerPaciente = async (req, res) => {
    const { id } = req.params;
    try {
        const paciente = await Paciente.findById( id );
    
        if ( !paciente ) return res.status(404).json( { msg: 'Paciente no encontrado' } );
    
        //Para que no sea un Object_id
        if ( paciente.veterinario._id.toString() !== req.veterinario.id.toString() ) return res.json( { msg:'Accion no valida' } );
    
        res.json( paciente );
    } catch (error) {
        return res.status(404).json( { msg: 'No se encontró información sobre el Paciente' } );
    };
};

const updatePaciente = async (req, res) => {
    const { id } = req.params;

    try {
        const paciente = await Paciente.findById( id );
        
        if ( !paciente ) return res.status(404).json( { msg: 'Paciente no encontrado' } );
    
        //Para que no sea un Object_id
        if ( paciente.veterinario._id.toString() !== req.veterinario.id.toString() ) return res.json( { msg:'Acción no valida' } );
    
        //Actualizar Valores
        paciente.nombre = req.body.nombre || paciente.nombre;
        paciente.propietario = req.body.propietario || paciente.propietario;
        paciente.email = req.body.email || paciente.email;
        paciente.sintomas = req.body.sintomas || paciente.sintomas;
    
        //Update
        const pacienteUpdate = await paciente.save();
        res.json( pacienteUpdate );
    } catch (error) {
        return res.status(404).json( { msg: 'No se encontró información sobre el Paciente' } );
    }
};

const deletePaciente = async (req, res) => {
    const { id } = req.params;
    try {
        const paciente = await Paciente.findById( id );
    
        if ( !paciente ) res.status(404).json( { msg: 'Paciente no encontrado' } );
    
        //Para que no sea un Object_id
        if ( paciente.veterinario._id.toString() !== req.veterinario.id.toString() ) return res.json( { msg:'Acción no valida' } );
    
        //Delete
        await paciente.deleteOne();
        res.json( { msg: 'Paciente Eliminado' } );
        
    } catch (error) {
        return res.status(404).json( { msg: 'Ah ocurrido un Error Inesperado' } );
    };
};

export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    updatePaciente,
    deletePaciente
};