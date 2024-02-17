class EvalNewPassword {
    checkIfPasswordIsValid(new_password) {
        const requiredChars = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
        const evalNewPassword = requiredChars.every((required) =>
            required.test(new_password));

        return evalNewPassword;
    };
};

module.exports = EvalNewPassword;
