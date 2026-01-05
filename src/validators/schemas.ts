import Joi from "joi";

export const loginSchema = Joi.object({
    telefon: Joi.string().required().messages({
        "string.empty": "Telefon raqami kiritilishi shart",
        "any.required": "Telefon raqami kiritilishi shart",
    }),
});

export const customerSchema = Joi.object({
    ism: Joi.string().required().messages({
        "string.empty": "Ism kiritilishi shart",
        "any.required": "Ism kiritilishi shart",
    }),
    telefon: Joi.string().required().messages({
        "string.empty": "Telefon raqami kiritilishi shart",
        "any.required": "Telefon raqami kiritilishi shart",
    }),
    manzil: Joi.string().allow("", null),
    izoh: Joi.string().allow("", null),
    faol: Joi.boolean(),
});

export const debtSchema = Joi.object({
    mijozId: Joi.number().required().messages({
        "number.base": "Mijoz tanlanishi shart",
        "any.required": "Mijoz tanlanishi shart",
    }),
    tovarNomi: Joi.string().required().messages({
        "string.empty": "Tovar nomi kiritilishi shart",
        "any.required": "Tovar nomi kiritilishi shart",
    }),
    umumiySumma: Joi.number().positive().required().messages({
        "number.base": "Summa raqam bo'lishi kerak",
        "number.positive": "Summa musbat bo'lishi kerak",
        "any.required": "Summa kiritilishi shart",
    }),
    berilganSana: Joi.date().required(),
    qaytarishMuddati: Joi.date().required(),
});

export const paymentSchema = Joi.object({
    qarzId: Joi.number().required().messages({
        "number.base": "Qarz tanlanishi shart",
        "any.required": "Qarz tanlanishi shart",
    }),
    summa: Joi.number().positive().required().messages({
        "number.base": "Summa raqam bo'lishi kerak",
        "number.positive": "Summa musbat bo'lishi kerak",
        "any.required": "Summa kiritilishi shart",
    }),
    izoh: Joi.string().allow("", null),
});
