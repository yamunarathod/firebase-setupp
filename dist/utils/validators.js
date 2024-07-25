// Example schema validator function
export const validateData = (schema, data) => {
    const { error } = schema.validate(data);
    return error ? error.details[0].message : null;
};
