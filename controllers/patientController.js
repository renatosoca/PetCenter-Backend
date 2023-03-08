import clientModel from "../models/clientModel.js";

const getPatients = async (req, res) => {
  const { _id } = req.user;

  try {
    const patients = await clientModel.find({ user: _id }).populate("user", "name lastname email");

    res.status(200).json({
      ok: true,
      patients
    });
  } catch (error) {
    res.status(500).json({ 
      msg: 'Error del sistema, comuniquese con el administrador'  
    });
  }
}

const createPatient = async (req, res) => {
  const { _id } = req.user;

  try {
    const patient = new clientModel(req.body);

    patient.user = _id;
    const savedPatient = await patient.save();

    res.status(201).json({ 
      ok: true,
      patient: savedPatient, 
    });
  } catch (error) {
    res.status(500).json({ 
      msg: 'Error del sistema, comuniquese con el administrador' 
    });
  }
}

const getPatient = async (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;

    try {
        const patient = await clientModel.findById( id );
        if ( !patient ) return res.status(404).json( { msg: 'Paciente no encontrado' } );
    
        if ( patient.user._id.toString() !== _id.toString() ) return res.status(401).json({ msg:'No autorizado para esta acción' });
    
        res.status(200).json({ ok: true, patient });
    } catch (error) {
        return res.status(500).json({ msg: 'Error del sistema, comuniquese con el administrador'  });
    };
};

const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;
  
  try {
    const patient = await clientModel.findById( id );
    if ( !patient ) return res.status(404).json({ ok: false, msg: 'Paciente no encontrado' });

    if ( patient.user._id.toString() !== _id.toString() ) return res.status(401).json({ msg: 'No autorizado para esta acción' });

    const newPatient = {
      ...req.body,
      user: _id,
    }
    const updatePatient = await clientModel.findByIdAndUpdate( id, newPatient, { new: true } );

    res.status(200).json({
      ok: true,
      patient: updatePatient,
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      msg: 'Error del sistema, comuniquese con el administrador' 
    });
  }
};

const deletePatient = async (req, res) => {
  const { id } = req.params;
  const { _id } = req.user;

  try {
    const patient = await clientModel.findById( id );
    if ( !patient ) return res.status(404).json({ ok: false, msg: 'Paciente no encontrado' });

    if ( patient.user._id.toString() !== _id.toString() ) return res.status(401).json({ msg: 'No autorizado para esta acción' });

    await patient.deleteOne();

    res.status(200).json({
      ok: true,
      msg: 'Paciente eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      msg: 'Error del sistema, comuniquese con el administrador' 
    });
  }
};

export {
    getPatients,
    createPatient,
    getPatient,
    updatePatient,
    deletePatient,
};