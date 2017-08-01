# Remedyforce Plugin

Our Remedyforce Plugin has been designed to allow the automatic creation of Remedyforce views in Clarive and vice versa,
so that you can have both services synchronized. To accomplish this, we use the Salesforce API REST version 39.0 (Spring
'17).

# What is Remedyforce BMC Remedyforce is a cloud-based IT service management tool, built on the Salesforce App Cloud,
that enables you to deliver high-speed service management that empowers users and accelerates the business, with minimal
capital investment.

## Installation

To install the plugin, place the `cla-remedyforce-plugin folder` inside `CLARIVE_BASE/plugins` directory in your Clarive
instance.

## How to use

Once the plugin is placed in its folder, you can start using it by going to your Clarive instance.

Fast setup steps:

1. Create a **New Connected App** in your Remedyforce account with OAuth Settings.
2. In Clarive, complete the **RemedyforceServer** Resource with your Remedyforce account.
3. Create a **form** with the fields for the new topic you wish to synchronize with the desired Remedyforce view.
4. Use the **RemedyfieldView** Resource to create a new view with field correspondence between your id form settings and
   their counterpart in Remedyforce.
5. Create three webservice rules for creating, updating and deleting topics, and add the corresponding Remedyforce
   **Inbound** palette service.
6. Create four event rules for creating, updating, changing status and deleting topics and add only the corresponding
   Remedyforce **Outbound** palette service in each case. Use post-offline in the events.
7. Create the corresponding **webhooks** for each webservice.

If you encounter difficulties with any of the steps, we recommend that you read the rest of this guide and that you read
the **FAQs** at the end of the document.

### RemedyforceServer:

This Resource is used to save your Remedyforce Server settings:

- **Username -** Your Remedyforce username.
- **Password -** Your Remedyforce password.
- **Consumer Key -** The ID number of your connected app at Remedyforce.
- **Security Token -** Authentication token of your account at Remedyforce.
- **Consumer Secret -** Consumer secret of your app connected at Remedyforce.
- **Login URL -** This is the URL the plugin we will attempt to connect to, with the default value set to
  https://login.salesforce.com/services/oauth2

Example:

        Username: example@bmcremedyforce.com
        Password: password
        Consumer Key: 3MVG9Hx6Zv05HarQ1l8pIL62JC5PmpO1ocJX_T4kxSBEsjajheL_CXjGvs92NxXhWOpoEH03C5K9Yi2466Sw7
        Security Token: JT7ZtSkxLfyGsK11BLdG6Mpd
        Consumer Secret: 8012766140293765752
        Login URL: https://login.salesforce.com/services/oauth2

Where can I find these values in my Remedyforce account?
- **Username:** click on your `name->My Settings->Personal->Personal Information` and checkout your username.

- **Security Token:** click on your `name->My Settings->Personal->Reset My Security Token`. You will receive an email
  with your new Security Token.

- **Consumer Key and Consumer Secret:** you will have to **create a new app**. In order to do so, go to
  `setup->build->create->apps->connected apps->New`. Here you will have to complete at least the following fields: --
**_Connected App Name_**: for example, "clarive" -- **_Api Name_**: (completed automatically) -- **_Contact Email_**:
your email address -- Check the **_Enable OAuth Settings_** box and write your **_Callback URL_** (see Remedyforce
example, 'https://login.salesforce.com/services/oauth2/callback') -- **_Selected OAuth Scopes_**: _Full access (full)_
recommended option.  Once you have saved the app, you can click on it to see a preview, where you can find the
**_Consumer Key_** and the **_Consumer Secret_**.

### RemedyforceView:

This Resource will synchronize any Clarive topic you choose with the desired Remedyforce view. That way, when you create
(update or delete) a topic or a view of this type, it will be created automatically on the other platform.

- **Remedyforce View Internal Name**: The internal name of the type of view you are going to create in Remedyforce. You
  can find these internal names at `Setup->Create->Objects`.
- **Clarive Topic Name**: The name in Clarive of the topic category you would like to be equivalent to the Remedyforce
  View Name.
- **Clarive - Remedyforce Field Correspondance**: The fields you wish to share between the two services must have their
  correspondence here, with the Clarive field names written to the left and the Remedyforce ones written to the right.
Clarive names must be the `id_field` name you have used in the form rule associated with the topic, and Remedyforce
names must be the id names of the fields you would like to correspond, which can be found at
`Setup->Create->Objects-><Your view>` (*API Name* column).
- **Clarive - Remedyforce List Correspondence: -** You will define the correspondence between the values of all fields
  of type 'reference'. For example, if 'status_new' can take different values, that are represented as ids in
Remedyforce, here you have to write those ids for each value.

Example:

        Remedyforce View Internal Name:     BMCServiceDesk__Incident__c
        Clarive Topic Name:                 Incident
        Clarive - Remedyforce Field Correspondance:
        - description                       BMCServiceDesk__incidentDescription__c
        - remedyforce_category              BMCServiceDesk__FKCategory__c
        - status_new                        BMCServiceDesk__FKStatus__c
        - impact                            BMCServiceDesk__FKImpact__c
        
        Clarive - Remedyforce List Correspondence:
        - status_new (Type: Hash)
            - 2 (New)                       a3w0Y000000kBuEQAU
            - 22 (In Progress)              a3w0Y000000kBujQAE
        - impact (Type: Hash)
            - High                          a2M0Y000000tKzPUAU
            - Medium                        a2M0Y000000tKzQUAU
            - Low                           a2M0Y000000tKzRUAU
        
We recommend that you use characteristic field types that match the Remedyforce field you wish to synchronize.

## Palette Services:

### Remedyforce Inbound

This palette service will perform an action in Clarive from Remedyforce. In order to do so, you have to place it in
a webservice previously synchronized with a [Salesforce Webhook].

Example of **Webhook** creation:
- Create a webservice called "inboundCreateRule".
- Create a Webhook with the desired _SObject_ setting and a URL such as `<your Clarive
  url>/rule/ws/<inboundCreateRule>?api_key=<your API Key in Clarive>`.

Service settings:

- **Remedyforce Server -** server with the user data from Remedyforce that will create the topic in Clarive.
- **Action -** the action to be performed. It can be Create, Update or Delete.

### Remedyforce Outbound Use this service to perform an action remotely from Clarive. The events must be of type
"post-offline".

Service settings:

- **Remedyforce Server -** server with the user data from Remedyforce that will create the topic in Clarive.
- **Action -** the action to be performed. It can be Create, Update, Delete or Change Status.

---

## Variables:

If you want to use this plugin in a specific project, you can create a Remedyforce variable so that you do not have to
choose all the specifications each time, setting the desired server you will use in the variable, and using it in the
communication between Remedyforce and Clarive.

This Resource variable must be created with the following settings:

- **Type -** CI.
- **CI Role -** Remedyforce.
- **CI Class -** select the specific CI Class it will use. In this case it will be the RemedyforceServer that you
  created.

Once you have created it in the Variables Class, you will be able to view it in the combos and use it whenever you wish.

You can create more variables if you need to, by following the same process.

---

## FAQs
- **Q:** **Why is my view not being created when I create a topic in Clarive?**
- **A:** Check that you have synchronized all the **required fields of the view** in your RemedyforceView CI. Note that
  not all the required fields have the _(Required)_ label, however you cannot create the view without it.
- **Q:** **Why is my topic not being created  when I create a view in Remedyforce?**
- **A:** Check that you have at least one initial status assigned to the topic you wish to create. Check also that you
  have typed all the variable names correctly.
- **Q:** **Why are my Impact/Urgency/Priority fields not being colored properly?**
- **A:** You may not have written the correspondence names as they are actually named in your RemedyforceView. Check the
  field _Options_ in your _Pills_ form (in Clarive form rule).

[Salesforce Webhook]: <https://salesforce-webhook-creator.herokuapp.com/app>   
