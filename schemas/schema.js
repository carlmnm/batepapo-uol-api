import Joi from "joi";

const participantSchema = Joi.object({
    name: Joi.string().min(1).required()
})

const messageSchema = Joi.object({
    to: Joi.string().min(1).required(),
    text: Joi.string().min(1).required(),
    type: Joi.string().valid("private_message", "message").required()
})

export {participantSchema, messageSchema}