const deploy_easy_token = async() => {
    const { func_deploy_fromfile } = require("./src/common/deploy");

    // 部署钱包
    const token_id = await func_deploy_fromfile("src/rho/deploy.rho", 0);

    // token id
    console.log("contract id: " + token_id);
};

deploy_easy_token();