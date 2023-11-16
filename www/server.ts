import mongoose from "mongoose";
import {app} from "@www/app";
import env from "@lib/env";

mongoose.connect(env.DB_URL_LOCAL)
    .then(() => {
    }
    ).catch(err => {
    console.log(err)
});

app.listen(env.PORT || 3000, '0.0.0.0', () => {
    console.log('App running on port 3000')
})