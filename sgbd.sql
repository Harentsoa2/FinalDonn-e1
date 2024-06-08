

create database bank;


\c bank;

--Table compte_bancaire

CREATE TABLE compte_bancaire (
    id_compte serial PRIMARY KEY,
    RIB VARCHAR(100),
    IBAN VARCHAR(100),
    solde DECIMAL(10, 2),
    prenom VARCHAR(150),
    nom VARCHAR(150),
    adresse TEXT,
    email_client VARCHAR(100) CHECK (
        email_client LIKE '%@gmail.com' OR
        email_client LIKE '%@yahoo.com' OR
        email_client LIKE '%@outlook.fr'
    ),
    password_client VARCHAR(100),
    tel_client VARCHAR(20),
    etoile FLOAT CHECK (etoile BETWEEN 0 AND 5),
    type_de_client VARCHAR(200) CHECK (type_de_client IN ('entreprise', 'particulier')),
    ref_client VARCHAR(100),
    gestionnaire_de_compte VARCHAR(200) CHECK (gestionnaire_de_compte IN ('Muriel (GC0012)', 'Eric (GC0023)', 'Gabriel (GC0056)', 'Eline (GC0026)', 'Germain (GC0089)', 'Gaston (GC0048)')),
    prêt VARCHAR(20) DEFAULT 'non' CHECK (prêt IN ('oui', 'non', 'en cours de demande')),
    type_prêt_client VARCHAR(30) 
);

--Table pret
CREATE TABLE pret (
    id_pret serial PRIMARY KEY,
    montant_pret INT,
    status_pret VARCHAR(200) CHECK (status_pret IN ('en cours de demande', 'accepter', 'non rendue')),
    type_pret VARCHAR(200),
    id_compte INT,
    CONSTRAINT fk_compte FOREIGN KEY (id_compte) REFERENCES compte_bancaire(id_compte)
);


-- Table carte bancaire
CREATE TABLE carte_bancaire (
    id_carte serial PRIMARY KEY,
    date_expiration DATE,
    numero_carte VARCHAR(20),
    status_carte VARCHAR(20) CHECK (status_carte IN ('activer', 'bloquer')),
    date_ouverture DATE,
    id_compte INT,
    CONSTRAINT fk_compte_bancaire FOREIGN KEY (id_compte) REFERENCES compte_bancaire(id_compte)
);

-- Table transactions
CREATE TABLE transactions (
    id_transaction serial PRIMARY KEY,
    description text,
    id_envoyeur integer NOT NULL,
    id_receveur integer NOT NULL,
    montant numeric(10,2) NOT NULL,
    date_transaction timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_diff_envoyeur_receveur CHECK (id_envoyeur <> id_receveur),
    CONSTRAINT fk_envoyeur FOREIGN KEY (id_envoyeur) REFERENCES compte_bancaire(id_compte),
    CONSTRAINT fk_receveur FOREIGN KEY (id_receveur) REFERENCES compte_bancaire(id_compte)
);

CREATE TABLE historique_transactions (
    id_historique serial PRIMARY KEY,
    id_compte integer NOT NULL,
    fait varchar(50),
    id_partenaire integer,
    resultat numeric(10,2),
    date_transaction timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_compte FOREIGN KEY (id_compte) REFERENCES compte_bancaire(id_compte),
    CONSTRAINT fk_partenaire FOREIGN KEY (id_partenaire) REFERENCES compte_bancaire(id_compte)
);


--  Voici 50 inserts aléatoires pour la table `client` :
INSERT INTO compte_bancaire (RIB, IBAN, solde, prenom, nom, adresse, email_client, password_client, tel_client, etoile, type_de_client, ref_client, gestionnaire_de_compte) VALUES
('1234567890', 'FR12345678901234567890', 1500.50, 'Alice', 'Dupont', '123 Rue Example', 'alice@gmail.com', 'password123', '0123456789', 4.5, 'particulier', 'REF1234', 'Muriel (GC0012)'),
('2345678901', 'FR23456789012345678901', 2000.75, 'Bob', 'Martin', '456 Rue Example', 'bob@yahoo.com', 'password456', '0987654321', 4.0, 'particulier', 'REF5678', 'Eric (GC0023)'),
('3456789012', 'FR34567890123456789012', 1800.25, 'Claire', 'Durand', '789 Rue Example', 'claire@outlook.fr', 'password789', '9876543210', 3.2, 'entreprise', 'REF9876', 'Gabriel (GC0056)'),
('4567890123', 'FR45678901234567890123', 2200.30, 'David', 'Lefebvre', '1010 Rue Example', 'david@gmail.com', 'password456', '0123456789', 3.8, 'particulier', 'REF6543', 'Eline (GC0026)'),
('5678901234', 'FR56789012345678901234', 1900.80, 'Emma', 'Garcia', '111 Rue Example', 'emma@yahoo.com', 'password123', '0987654321', 4.3, 'entreprise', 'REF2468', 'Germain (GC0089)'),
('6789012345', 'FR67890123456789012345', 1600.65, 'Gabriel', 'Leroy', '1212 Rue Example', 'gabriel@outlook.fr', 'password789', '9876543210', 3.9, 'particulier', 'REF1357', 'Gaston (GC0048)'),
('7890123456', 'FR78901234567890123456', 2300.40, 'Hugo', 'Fournier', '1313 Rue Example', 'hugo@gmail.com', 'password456', '0123456789', 4.8, 'particulier', 'REF7890', 'Muriel (GC0012)'),
('8901234567', 'FR89012345678901234567', 2100.90, 'Isabelle', 'Thomas', '1414 Rue Example', 'isabelle@yahoo.com', 'password123', '0987654321', 4.2, 'entreprise', 'REF9632', 'Eric (GC0023)'),
('9012345678', 'FR90123456789012345678', 2400.20, 'Julie', 'Robert', '1515 Rue Example', 'julie@outlook.fr', 'password789', '9876543210', 3.5, 'particulier', 'REF7531', 'Gabriel (GC0056)'),
('0123456789', 'FR01234567890123456789', 1700.55, 'Kevin', 'Petit', '1616 Rue Example', 'kevin@gmail.com', 'password456', '0123456789', 4.1, 'entreprise', 'REF1598', 'Eline (GC0026)'),
('1234567890', 'FR12345678901234567890', 2500.70, 'Laurent', 'Dubois', '1717 Rue Example', 'laurent@yahoo.com', 'password123', '0987654321', 4.4, 'particulier', 'REF3579', 'Germain (GC0089)'),
('2345678901', 'FR23456789012345678901', 2000.25, 'Marie', 'Moreau', '1818 Rue Example', 'marie@outlook.fr', 'password789', '9876543210', 3.7, 'entreprise', 'REF4562', 'Gaston (GC0048)'),
('3456789012', 'FR34567890123456789012', 2600.35, 'Nicolas', 'Girard', '1919 Rue Example', 'nicolas@gmail.com', 'password456', '0123456789', 4.6, 'particulier', 'REF8520', 'Muriel (GC0012)'),
('4567890123', 'FR45678901234567890123', 1700.45, 'Olivia', 'Gauthier', '2020 Rue Example', 'olivia@yahoo.com', 'password123', '0987654321', 3.3, 'entreprise', 'REF2587', 'Eric (GC0023)'),
('5678901234', 'FR56789012345678901234', 2100.85, 'Paul', 'Martin', '2121 Rue Example', 'paul@outlook.fr', 'password789', '9876543210', 4.9, 'particulier', 'REF9513', 'Gabriel (GC0056)'),
('6789012345', 'FR67890123456789012345', 1800.60, 'Quentin', 'Lefevre', '2222 Rue Example', 'quentin@gmail.com', 'password456', '0123456789', 3.6, 'entreprise', 'REF6428', 'Eline (GC0026)'),
('7890123456', 'FR78901234567890123456', 2400.95, 'Romain', 'Roux', '2323 Rue Example', 'romain@yahoo.com', 'password123', '0987654321', 4.0, 'particulier', 'REF3698', 'Germain (GC0089)'),
('8901234567', 'FR89012345678901234567', 1900.15, 'Sophie', 'Leclerc', '2424 Rue Example', 'sophie@outlook.fr', 'password789', '9876543210', 3.1, 'entreprise', 'REF7530', 'Gaston (GC0048)');


INSERT INTO carte_bancaire (date_expiration, numero_carte, status_carte, date_ouverture, id_compte) VALUES
( '2025-05-01', '1234567890123456', 'activer', '2024-01-01', 1),
('2026-07-01', '2345678901234567', 'activer', '2024-02-01', 2),
('2027-09-01', '3456789012345678', 'activer', '2024-03-01', 3),
('2025-10-01', '4567890123456789', 'activer', '2024-04-01', 4),
( '2026-11-01', '5678901234567890', 'activer', '2024-05-01', 5),
('2027-12-01', '6789012345678901', 'activer', '2024-06-01', 6),
('2028-01-01', '7890123456789012', 'activer', '2024-03-01', 7),
('2029-02-01', '8901234567890123', 'activer', '2024-01-01', 8),
('2025-03-01', '9012345678901234', 'activer', '2024-05-01', 9),
('2025-04-01', '0123456789012345', 'activer', '2024-03-01', 10);






CREATE OR REPLACE FUNCTION update_solde()
RETURNS TRIGGER AS $$
BEGIN

    UPDATE compte_bancaire
    SET solde = solde - NEW.montant
    WHERE id_compte = NEW.id_envoyeur;


    UPDATE compte_bancaire
    SET solde = solde + NEW.montant
    WHERE id_compte = NEW.id_receveur;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_solde
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_solde();






CREATE OR REPLACE FUNCTION update_client_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status_pret = 'en cours de demande' THEN
        UPDATE compte_bancaire
        SET prêt = 'oui',
            type_prêt_client = NEW.type_pret
        WHERE id_compte = NEW.id_compte;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_client_status
AFTER INSERT ON pret
FOR EACH ROW
EXECUTE FUNCTION update_client_status();





CREATE OR REPLACE FUNCTION log_transaction()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO historique_transactions (id_compte, fait, id_partenaire, resultat, date_transaction)
    VALUES (NEW.id_envoyeur, 'envoi d''argent', NEW.id_receveur, -NEW.montant, NEW.date_transaction);

    INSERT INTO historique_transactions (id_compte, fait, id_partenaire, resultat, date_transaction)
    VALUES (NEW.id_receveur, 'réception d''argent', NEW.id_envoyeur, NEW.montant, NEW.date_transaction);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_log_transaction
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION log_transaction();

CREATE VIEW vue_transactions AS
SELECT
    ht.id_compte,
    fait,
    cb.email_client,
    ht.resultat,
    ht.date_transaction
FROM
    compte_bancaire cb
LEFT JOIN
    historique_transactions ht ON cb.id_compte = ht.id_partenaire;



 