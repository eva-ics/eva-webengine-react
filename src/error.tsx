import { EvaError } from "@eva-ics/webengine";

export const EvaErrorMessage = ({
    error,
    className,
}: {
    error?: EvaError;
    className?: string;
}) => {
    return (
        <div className={`eva-error ${className || ""}`}>
            {error
                ? "Error" +
                  (error.message ? ": " + error.message : "") +
                  ` (${error.code})`
                : ""}
        </div>
    );
};
