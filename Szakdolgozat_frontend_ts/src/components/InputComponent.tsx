import { FormControl, FormErrorMessage, FormLabel, Input } from "@chakra-ui/react";
import { FC } from "react";
import { UseFormRegister } from 'react-hook-form'


interface InputProps {
    name: string
    label?: string
    errorMessage?: string
    error: boolean
    register: UseFormRegister<any>
    placeholder?: string
    required?: boolean,
    variant?: React.ComponentProps<typeof Input>["variant"];
    type?: React.HTMLInputTypeAttribute,
    defaultValue?: string | number,
    autoComplete?: string,
    tabIndex?: number
}

const InputComponent: FC<InputProps> = ({
    register,
    name,
    error,
    errorMessage,
    label,
    required,
    ...rest
}) => {
    return (
        <FormControl isInvalid={error}>
            {label && <FormLabel>{label}</FormLabel>}
            <Input
                {...register(name, { required: required })}
                {...rest}
            />
            {error && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
        </FormControl>
    );
};

export default InputComponent;