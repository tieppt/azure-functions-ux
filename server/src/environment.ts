export namespace environment {
    export function isAzure() {
        return !!process.env.WEBSITE_INSTANCE_ID;
    }
}