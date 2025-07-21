
export default function(res, status, data, error, msg) {
    res.status(status).json({
        error,
        msg,
        data
    });
}