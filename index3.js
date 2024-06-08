const pool = require('./db');
const prompt = require('prompt-sync')();
const { v4: uuidv4 } = require('uuid');
const readlineSync = require('readline-sync');

function saisirMotDePasse(message) {
    return readlineSync.question(message, {
        hideEchoBack: true // Masque la saisie
    });
}

function pcp() {

   

        console.log("---------------------------------------------------------------------------------------------------------------------------");
        console.log("Bonjour taper 1 pour se connecter ou 2 pour s'inscrire");
        console.log();
        console.log();
        console.log(" 1. SE CONNECTER ");
        console.log();
        console.log(" 2. S'INSCRIRE");
        console.log();
        console.log(" 3. Quitter");
        console.log();
        console.log("---------------------------------------------------------------------------------------------------------------------------");
        const choisi = parseFloat(prompt("Votre choix : "))

        if (choisi == 2) {
            inscription();
        }
        else if (choisi == 1) {
            main();
        }
        else if (choisi == 3) {
            console.log("Au revoir");
            process.exit(0); 
        }
        else {
            console.log("Choix invalide");

        }
    
}

async function fetchUpdatedBalance(client, userId) {
    try {
        const balanceResult = await client.query('SELECT solde FROM comptes WHERE id_compte = $1', [userId]);
        if (balanceResult.rows.length > 0) {
            return balanceResult.rows[0].solde;
        } else {
            console.error('Compte non trouvé');
            return null;
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du solde:', err);
        return null;
    }
}

function getRandomDigits(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

const generateCardNumber = () => {
    let cardNumber = '';
    for (let i = 0; i < 16; i++) {
        cardNumber += Math.floor(Math.random() * 10);
    }
    return cardNumber;
};

async function connectToDatabase() {
    try {
        const client = await pool.connect();
        return client;
    } catch (err) {
        console.error('Erreur de connexion à la base de données', err);
        return null;
    }
}


// Function to fetch the updated balance
async function fetchUpdatedBalance(client, userId) {
    try {
        const balanceResult = await client.query('SELECT solde FROM compte_bancaire WHERE id_compte = $1', [userId]);
        if (balanceResult.rows.length > 0) {
            return balanceResult.rows[0].solde;
        } else {
            console.error('Compte non trouvé');
            return null;
        }
    } catch (err) {
        console.error('Erreur lors de la récupération du solde:', err);
        return null;
    }
}

async function actualiserSolde(user) {
    let quit = false;
    while (!quit) {
        const client = await pool.connect();
        if (!client) {
            console.log("Échec de la connexion. Réessayez plus tard.");
            break;
        }

        try {
            // Fetch and update the user's balance
            user.solde = await fetchUpdatedBalance(client, user.id_compte);
            if (user.solde === null) {
                console.log("Impossible de récupérer le solde. Réessayez plus tard.");
                client.release();
                break;
            }

            // Clear the console to refresh the display
            console.clear();
            console.log('Connexion réussie');
            console.log("---------------------------------------------------------------------------------------------------------------------------");
            console.log(`Nom : ${user.nom}                               Prénom : ${user.prenom}`);
            console.log();
            console.log(`Référence client : ${user.ref_client}           Type de client : ${user.type_de_client}`);
            console.log();
            console.log(`Email : ${user.email_client}                    Votre étoile : ${user.etoile}`);
            console.log("---------------------------------------------------------------------------------------------------------------------------");
            console.log('Informations du compte :');
            console.log();
            console.log(`RIB : ${user.rib}`);
            console.log();
            console.log(`IBAN : ${user.iban}`);

            console.log(`________________________________`);
            console.log(`|                               |`);
            console.log(`| Votre solde: ${user.solde}                 |`);
            console.log(`|                               |`);
            console.log(`_________________________________`);
            console.log();
            console.log();

            const carteBancaireQuery = 'SELECT * FROM carte_bancaire WHERE id_compte = $1';
            const carteBancaireResult = await client.query(carteBancaireQuery, [user.id_compte]);

            let carte = true;

            if (carteBancaireResult.rows.length > 0) {
                console.log('Votre Carte bancaire  :');
                const carteBancaire = carteBancaireResult.rows[0];
                console.log(`Numéro de carte : ${carteBancaire.numero_carte}`);
                console.log(`Date d'expiration : ${carteBancaire.date_expiration}`);
                console.log(`Date d'ouverture : ${carteBancaire.date_ouverture}`);
                console.log(`Status de la carte : ${carteBancaire.status_carte}`);
            } else {
                console.log('Aucune carte bancaire associée à ce compte. Venez à l\'agence pour avoir une carte bancaire physique. Toutefois, vous pouvez générer une carte bancaire virtuelle');
                carte = false;
            }

            try {
                const result = await client.query('SELECT fait, email_client, resultat, vue_transactions.date_transaction FROM vue_transactions WHERE id_compte = $1', [user.id_compte]);
                console.table(result.rows);
            } catch (err) {
                console.error('Erreur lors de la récupération des transactions:', err);
            }

            console.log("---------------------------------------------------------------------------------------------------------------------------");
            console.log("Qu'est ce que vous voulez faire :");
            console.log("");
            console.log("1. Demande de prêt");
            console.log("2. Virement");
            console.log("3. Actualiser");
            console.log("4. Retrait");
            console.log("5. Dépôt");
            console.log("6. Générer une carte bancaire virtuelle");
            console.log("7. Bloquer ou débloquer une carte");
            console.log("8. Quitter");
            console.log("---------------------------------------------------------------------------------------------------------------------------");

            const choice = prompt('Entrez votre choix: ');

            if (choice === '1') {
                await demandePret(user);
            } else if (choice === '2') {
                await effectuerVirement(user);
                user.solde = await fetchUpdatedBalance(client, user.id_compte);
            } else if (choice === '3') {
                user.solde = await fetchUpdatedBalance(client, user.id_compte);
                continue;
            } else if (choice === '4') {
                await retrait(user);
                user.solde = await fetchUpdatedBalance(client, user.id_compte);
            } else if (choice === '5') {
                await depot(user);
                user.solde = await fetchUpdatedBalance(client, user.id_compte);
            } else if (choice === '6') {
                if (!carte) {
                    await generateAndInsertCard(user.id_compte);
                } else {
                    console.log("Vous avez déjà une carte");
                }
            } else if (choice === '7') {
                await control(user.id_compte);
            } else if (choice === '8') {
                pcp();
            } else {
                console.log("Choix invalide. Réessayez.");
            }
        } catch (err) {
            console.error('Erreur de traitement', err);
        } finally {
            client.release();
        }
    }
}

module.exports = { actualiserSolde };


async function inscription() {
    // Prompt the user for each input
    console.log("---------------------------------------------------------------------------------------------------------------------------");
    const prenom = prompt('Enter prenom: ');
    console.log();
    const nom = prompt('Enter nom: ');
    console.log();
    const adresse = prompt('Enter adresse: ');
    console.log();
    const email_client = prompt('Enter email_client: ');
    console.log();
    const password_client = saisirMotDePasse('Enter password_client: ');
    console.log();
    const tel_client = prompt('Enter tel_client: ');
    console.log();
    console.log("---------------------------------------------------------------------------------------------------------------------------");

    const RIB = getRandomDigits(10);
    const IBAN = 'FR' + getRandomDigits(20);
    const etoile = 5;
    const solde = 0;
    const ref_client = 'REF' + getRandomDigits(4);
    const gestionnaire_de_compte = 'Muriel (GC0012)';

    const query = `
        INSERT INTO compte_bancaire (
            RIB, IBAN, solde, prenom, nom, adresse, email_client, password_client, 
            tel_client, etoile, type_de_client, ref_client, gestionnaire_de_compte
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;
    const values = [
        RIB, IBAN, solde, prenom, nom, adresse, email_client, password_client,
        tel_client, etoile, 'particulier', ref_client, gestionnaire_de_compte
    ];

    try {
        const res = await pool.query(query, values);
        console.log('Insertion successful');
    } catch (err) {
        console.error('Error executing query');
    }
}

const generateAndInsertCard = async (id_compte) => {
    const date_expiration = new Date();
    date_expiration.setFullYear(date_expiration.getFullYear() + 3); // Set expiration date to 3 years from now
    const numero_carte = generateCardNumber(); // Generate a random 16-digit card number
    const status_carte = 'activée'; // Set status to 'activée'
    const date_ouverture = new Date(); // Set opening date to today

    try {
        await pool.connect(); // Connect to PostgreSQL

        const query = `
            INSERT INTO carte_bancaire (date_expiration, numero_carte, status_carte, date_ouverture, id_compte)
            VALUES ($1, $2, $3, $4, $5)
        `;

        const values = [
            date_expiration,
            numero_carte,
            status_carte,
            date_ouverture,
            id_compte,
        ];

        await pool.query(query, values); // Execute the query
        console.log('Card inserted successfully!');
    }
    catch (err) {
        console.error('Error inserting card:', err);
    } finally {
        await pool.end(); // Close the connection
    }
};


async function main() {
    try {
        console.log("---------------------------------------------------------------------------------------------------------------------------");
        const email = prompt('Entrez votre email: ');

        // Vérifier si l'email existe dans la base de données
        const emailCheckQuery = 'SELECT * FROM compte_bancaire WHERE email_client = $1';
        const emailResult = await pool.query(emailCheckQuery, [email]);

        if (emailResult.rows.length === 0) {
            console.log('Email incorrect');
            return;
        }

        const user = emailResult.rows[0];

        const password = saisirMotDePasse('Enter your password: ');

        if (user.password_client === password) {

            console.log("---------------------------------------------------------------------------------------------------------------------------");
            console.log();
            console.log();
            console.log();
            await actualiserSolde(user);
        } else {
            console.log('Mot de passe incorrect');
        }
    } catch (err) {
        console.error('Erreur de connexion à la base de données', err);
    } finally {
        pool.end();
    }
}

async function control(id_compte) {
    try {
        const client = await pool.connect();
        await client.query('BEGIN');

        // Récupérer le statut actuel de la carte
        const statusQuery = 'SELECT status_carte FROM carte_bancaire WHERE id_compte = $1';
        const { rows } = await client.query(statusQuery, [id_compte]);
        const currentStatus = rows[0].status_carte;

        // Inverser le statut
        const newStatus = currentStatus === 'activer' ? 'bloquer' : 'activer';
        const updateQuery = 'UPDATE carte_bancaire SET status_carte = $1 WHERE id_compte = $2';
        await client.query(updateQuery, [newStatus, id_compte]);

        await client.query('COMMIT');
        console.log(`Carte  ${newStatus} avec succés.`);
        client.release();
    } catch (err) {
        console.error('Erreur lors du basculement du statut de la carte:', err);
    }
}



const emailCheckQuery = `
    SELECT * 
    FROM compte_bancaire
    WHERE email_client = $1
`

async function retrait(user) {
    console.log("---------------------------------------------------------------------------------------------------------------------------");
    console.log("Retrait vers paypal");
    const mail = prompt("Votra addresse mail payapl : ")
    console.log();
    console.log();
    try {
        const montant = parseFloat(prompt('Entrez le montant à retirer: '));
        console.log("---------------------------------------------------------------------------------------------------------------------------");

        if (isNaN(montant) || montant <= 0) {
            console.log("Montant invalide. Réessayez.");
            return;
        }

        if (montant > user.solde) {
            console.log("Fonds insuffisants.");
            return;
        }

        user.solde -= montant;

        const client = await pool.connect();
        await client.query('BEGIN');

        // Mettre à jour le solde du compte
        const updateSoldeQuery = 'UPDATE compte_bancaire SET solde = $1 WHERE id_compte = $2';
        await client.query(updateSoldeQuery, [user.solde, user.id_compte]);

        // Insérer une nouvelle ligne dans historique_transactions
        const insertHistoriqueQuery = `
            INSERT INTO historique_transactions (id_compte, fait, resultat)
            VALUES ($1, $2, $3)
        `;
        const fait = 'retrait paypal';
        const resultat = -montant; // Le résultat du retrait est négatif
        await client.query(insertHistoriqueQuery, [user.id_compte, fait, resultat]);

        await client.query('COMMIT');
        console.log(`Retrait de ${montant} effectué avec succès. Nouveau solde: ${user.solde}`);
        client.release();
    } catch (err) {
        console.error('Erreur lors du retrait', err);
        // En cas d'erreur, on doit annuler la transaction
        try {
            await client.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Erreur lors du rollback:', rollbackErr);
        } finally {
            client.release();
        }
    }
}



async function depot(user) {
    console.log("---------------------------------------------------------------------------------------------------------------------------");
    console.log("Depot venant de paypal");
    const mail = prompt("Votra addresse mail paypal : ")
    console.log();
    console.log();
    try {
        const montant = parseFloat(prompt('Entrez le montant à déposer: '));
        console.log("---------------------------------------------------------------------------------------------------------------------------");

        if (isNaN(montant) || montant <= 0) {
            console.log("Montant invalide. Réessayez.");
            return;
        }

        user.solde = parseFloat(user.solde);
        user.solde += montant;

        const client = await pool.connect();
        await client.query('BEGIN');

        // Mettre à jour le solde du compte
        const updateSoldeQuery = 'UPDATE compte_bancaire SET solde = $1 WHERE id_compte = $2';
        await client.query(updateSoldeQuery, [user.solde, user.id_compte]);

        // Insérer une nouvelle ligne dans historique_transactions
        const insertHistoriqueQuery = `
            INSERT INTO historique_transactions (id_compte, fait, resultat)
            VALUES ($1, $2, $3)
        `;
        const fait = 'depot paypal';
        const resultat = montant;
        await client.query(insertHistoriqueQuery, [user.id_compte, fait, resultat]);

        await client.query('COMMIT');
        console.log(`Dépôt de ${montant} effectué avec succès. Nouveau solde: ${user.solde}`);
        client.release();
    } catch (err) {
        console.error('Erreur lors du dépôt', err);

        try {
            await client.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Erreur lors du rollback:', rollbackErr);
        } finally {
            client.release();
        }
    }
}


async function demandePret(user) {
    const typesPret = {
        '1': { type: 'prêt familiale', montant: 10000, durée: '6 mois', validation: '1-3 jours', taux: 5, status: 'en cours de demande' },
        '2': { type: 'prêt express', montant: 1000, durée: '1 mois', validation: '24 heures', taux: 10, status: 'en cours de demande' },
        '3': { type: 'prêt affaire', montant: 100000, durée: '1 an', validation: '7-10 jours', taux: 15, status: 'en cours de demande' }
    };

    console.log("---------------------------------------------------------------------------------------------------------------------------");
    console.log('Choisir parmi les prêts suivants :');
    console.log();
    console.log();
    console.log('1. prêt familiale 10000 Euro durée 6 mois delai de validation 1-3j taux d interet 5%');
    console.log();
    console.log('2. prêt express 1000 Euro  1 mois  delai de validation 24h taux d interet 10%');
    console.log();
    console.log('3. prêt affaire 100000 euro 1 ans delai de validation 7 - 10 taux d interet 15%');
    console.log();
    console.log("---------------------------------------------------------------------------------------------------------------------------");


    const choixPret = prompt('Entrez le numéro de votre choix: ').trim().toString();
    const pret = typesPret[choixPret];

    if (!isNaN(choixPret) && choixPret in typesPret) {
        const pret = typesPret[choixPret];
        const allowedTypes = ['prêt familiale', 'prêt affaire', 'prêt express'];
        if (allowedTypes.includes(pret.type)) {
            const pretInsertQuery = `
        INSERT INTO pret (montant_pret, status_pret, type_pret, id_compte)
        VALUES ($1, $2, $3, $4)
        `;
            await pool.query(pretInsertQuery, [pret.montant, pret.status, pret.type, user.id_compte]);
            console.log(`Demande de ${pret.type} enregistrée avec succès!`);
        } else {
            console.log("Type de prêt non autorisé.");
        }
    } else {
        console.log("Choix invalide.");
    }
}


async function effectuerVirement(user) {
    const emailReceveur = prompt('Entrez l\'email du destinataire: ');
    const receveurResult = await pool.query(emailCheckQuery, [emailReceveur]);

    if (receveurResult.rows.length === 0 || user.email_client === emailReceveur) {
        console.log('Email du destinataire incorrect ou identique à l\'envoyeur');
        return;
    }

    const receveur = receveurResult.rows[0];
    const montant = prompt('Entrez le montant: ');

    // Vérification du montant
    if (!/^\d+(\.\d+)?$/.test(montant) || parseFloat(montant) <= 0) {
        console.log('Montant invalide');
        return;
    }

    const description = prompt('Entrez la description: ');

    const transactionInsertQuery = `
        INSERT INTO transactions (description, id_envoyeur, id_receveur, montant)
        VALUES ($1, $2, $3, $4)
    `;
    await pool.query(transactionInsertQuery, [description, user.id_compte, receveur.id_compte, montant]);
    console.log('Virement effectué avec succès');

    const historiqueQuery = `
        SELECT description, montant, date_transaction 
        FROM transactions 
        WHERE id_envoyeur = $1 ORDER BY date_transaction DESC
        `;
    const historiqueResult = await pool.query(historiqueQuery, [user.id_compte]);
}





pcp();