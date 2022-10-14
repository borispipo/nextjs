import DataTypes from "$dataTypes";
export default {
    domain : {
        name : "site_domain",
        primary :true,
        title : "Domaine",
        type : DataTypes.STRING.type,
        nullable : false,
        unique : true,
        length : 60
    },
    protocol : {
        name : "site_domain_protocol",
        title : 'Protocol',
        type : DataTypes.STRING.type,
        length : 10,
    },
    region : {
        name :"site_domain_region",
        title : "Region",
        type : DataTypes.STRING.type,
        nullable : false,
        length : 10,
    },
    name : {
        name : "site_name",
        title : "Nom du site",
        type : DataTypes.STRING.type,
        nullable : true,
        length :  60
    },
    isSubdomain : {
        name : "site_is_subdomain",
        title : "Est un sous domaine",
        type : DataTypes.TINYINT.type,
        width : 1,
    },
    label : {
        name : 'site_label',
        title : "Description",
        type : DataTypes.STRING.type ,
        nullable : true,
        length : 255
    },
    isAssigned : {
        name : "site_domain_assigned",
        title : "Atribué",
        type : DataTypes.TINYINT.type,
        nullable : true,
    },
    type : {
        name : 'site_app_type',
        title : 'Type d\'application',
        type : DataTypes.STRING.type ,
        nullable : false,
        length : 10
    },
    status : {
        name : "site_status",
        title : 'Actif',
        type : DataTypes.TINYINT.type,
    },
    deviceCode : {
        name : 'site_device_code',
        title : "Code de l'instance",
        type : DataTypes.STRING.type ,
        nullable :true,
        length : 30
    },
    deviceHost : {
        name : 'site_device_host',
        title : "Adresse web locale",
        type : DataTypes.STRING.type ,
        nullable :true,
        length : 80
    },
    dataSources : {
        name : 'site_data_sources',
        type: DataTypes.LONGTEXT.type,
        nullable: true,
        title : "Sources de données",
    },
    deviceComputername : {
        name : 'site_device_computername',
        title : "Nom de l'ordinateur",
        type : DataTypes.STRING.type ,
        nullable :true,
        length : 80
    },
    deviceId : {
        name : 'site_device_id',
        title : "Unique Id",
        type : DataTypes.STRING.type ,
        nullable :true,
        length : 120
    },
    oauthClientId : {
        name : "site_oauth_client_id",
        title : "OAouth ID client",
        type : DataTypes.STRING.type,
        length : 120,
    },
    oauthSecret : {
        name : "site_oauth_client_secret",
        title : "OAouth Secret",
        type : DataTypes.STRING.type,
        length : 120,
    },
    basicAuthUsername : {
        name : "site_basic_auth_username",
        title : "Serveur Nom d\'utilisateur",
        type : DataTypes.STRING.type,
        length : 80
    },
    basicAuthPassword : {
        name : "site_basic_auth_password",
        title : "Serveur Mod de pass",
        type : DataTypes.STRING.type,
        length : 80
    },
    apiRateLimit : {
        name : 'site_api_rate_limit',
        type: DataTypes.INTEGER.type,
        title : "Nbr requêtes max par sec",
    },
    customerCode : {
        name : 'fk_customers_cust_code',
        type: DataTypes.STRING.type,
        nullable: false,
        title : "Code client",
        length : 30
    },
    /*tempDomain : {
        name : "site_temp_domain",
        title : "Domaine temporaire",
        type : DataTypes.STRING.type,
        length : 80
    },
    tempDomainDate : {
        name : "site_temp_domain_date",
        title : "Date domaine temporaire",
        type : DataTypes.DATETIME.type,
    },*/
}