-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `all_plano` (
	`id_pk` varchar(50) NOT NULL,
	`ID_PLANEJAMENTO` int(11) DEFAULT 'NULL',
	`COD_UNIDADE` varchar(10) DEFAULT 'NULL',
	`NOME_UNIDADE` varchar(100) DEFAULT 'NULL',
	`COD_CENTROCUSTO` varchar(20) DEFAULT 'NULL',
	`NOME_CENTROCUSTO` varchar(100) DEFAULT 'NULL',
	`ESTRUTURA_CONTA` varchar(50) DEFAULT 'NULL',
	`ESTRUTURA_CONTA_NIVELSUPERIOR` varchar(50) DEFAULT 'NULL',
	`NOME_CONTA` varchar(150) DEFAULT 'NULL',
	`CONTA_EXTERNA` varchar(50) DEFAULT 'NULL',
	`MES` char(2) DEFAULT 'NULL',
	`ANO` char(4) DEFAULT 'NULL',
	`VALOR_ORCADO` decimal(18,6) DEFAULT 'NULL',
	`VALOR_REALIZADO` decimal(18,6) DEFAULT 'NULL',
	`JUSTIFICATIVA` text DEFAULT 'NULL',
	`COD_PROJETO` varchar(20) DEFAULT 'NULL',
	`NOME_PROJETO` varchar(150) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `cbk_contratos` (
	`ContractNumber` varchar(50) NOT NULL,
	`ContractIdentifier` varchar(100) DEFAULT 'NULL',
	`ContractInternalId` varchar(100) NOT NULL,
	`Currency` varchar(10) DEFAULT 'NULL',
	`Modality` varchar(100) DEFAULT 'NULL',
	`CreditDate` date DEFAULT 'NULL',
	`OriginalDueDate` date DEFAULT 'NULL',
	`TotalTerm` int(11) DEFAULT 'NULL',
	`ElapsedTerm` int(11) DEFAULT 'NULL',
	`RemainingTerm` int(11) DEFAULT 'NULL',
	`TotalPayments` int(11) DEFAULT 'NULL',
	`RemainingPayments` int(11) DEFAULT 'NULL',
	`AverageTerm` decimal(10,2) DEFAULT 'NULL',
	`ByRate_Amount` decimal(18,2) DEFAULT 'NULL',
	`ByRate_Principal` decimal(18,2) DEFAULT 'NULL',
	`ByRate_Interest` decimal(18,2) DEFAULT 'NULL',
	`ByRate_Restatement` decimal(18,2) DEFAULT 'NULL',
	`ByRate_ExchangeVariation` decimal(18,2) DEFAULT 'NULL',
	`ShortTerm_Amount` decimal(18,2) DEFAULT 'NULL',
	`ShortTerm_Principal` decimal(18,2) DEFAULT 'NULL',
	`ShortTerm_Interest` decimal(18,2) DEFAULT 'NULL',
	`ShortTerm_Restatement` decimal(18,2) DEFAULT 'NULL',
	`ShortTerm_ExchangeVariation` decimal(18,2) DEFAULT 'NULL',
	`LongTerm_Amount` decimal(18,2) DEFAULT 'NULL',
	`LongTerm_Principal` decimal(18,2) DEFAULT 'NULL',
	`LongTerm_Interest` decimal(18,2) DEFAULT 'NULL',
	`LongTerm_Restatement` decimal(18,2) DEFAULT 'NULL',
	`LongTerm_ExchangeVariation` decimal(18,2) DEFAULT 'NULL',
	`CompanyName` varchar(255) DEFAULT 'NULL',
	`CompanyCNPJ` varchar(20) DEFAULT 'NULL',
	`BankName` varchar(255) DEFAULT 'NULL',
	`BankNumber` varchar(10) DEFAULT 'NULL',
	`BankCNPJ` varchar(20) DEFAULT 'NULL',
	`MesAnoReferencia` varchar(7) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cbk_parcelas` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`matchon_key` varchar(100) NOT NULL,
	`contract_internal_id` varchar(50) NOT NULL,
	`kind` varchar(50) NOT NULL,
	`date` date NOT NULL,
	`order_info` varchar(10) NOT NULL DEFAULT '''N/A''',
	`amount` decimal(15,2) NOT NULL,
	`payment_date` date NOT NULL,
	`bank_number` char(3) NOT NULL,
	`bank_name` varchar(50) NOT NULL,
	`bank_fullname` varchar(100) NOT NULL,
	`bank_cnpj` char(14) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `elogios_internos` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`matricula` varchar(20) NOT NULL,
	`elogio` text NOT NULL,
	`motorista` varchar(255) DEFAULT 'NULL',
	`latitude` decimal(10,8) DEFAULT 'NULL',
	`longitude` decimal(11,8) DEFAULT 'NULL',
	`maps_link` varchar(255) DEFAULT 'NULL',
	`data_hora` datetime NOT NULL DEFAULT 'current_timestamp()',
	`telefone` varchar(20) DEFAULT 'NULL',
	`cidade` varchar(100) DEFAULT 'NULL',
	`estado` varchar(100) DEFAULT 'NULL',
	`token_avaliador` varchar(36) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `elogios_motoristas` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`data_hora` datetime DEFAULT 'current_timestamp()',
	`nome` varchar(100) NOT NULL,
	`carreta` varchar(50) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`elogio` text NOT NULL,
	`latitude` decimal(10,6) DEFAULT 'NULL',
	`longitude` decimal(10,6) DEFAULT 'NULL',
	`maps_link` varchar(255) DEFAULT 'NULL',
	`user_agent` varchar(255) DEFAULT 'NULL',
	`cidade` varchar(100) DEFAULT 'NULL',
	`estado` varchar(100) DEFAULT 'NULL',
	`token_avaliador` varchar(36) DEFAULT 'NULL',
	`data_registro` datetime DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `gbx_performance` (
	`MotoristaID` int(11) DEFAULT 'NULL',
	`NomeMotorista` varchar(255) DEFAULT 'NULL',
	`DocumentNumber` varchar(50) DEFAULT 'NULL',
	`DataReferencia` varchar(10) DEFAULT 'NULL',
	`Reward` decimal(10,2) DEFAULT 'NULL',
	`TotalKM` decimal(10,2) DEFAULT 'NULL',
	`Score` decimal(10,2) DEFAULT 'NULL',
	`id-pk` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gbx_statitics` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`vehicle_identification` varchar(20) DEFAULT 'NULL',
	`start_date` datetime DEFAULT 'NULL',
	`end_date` datetime DEFAULT 'NULL',
	`average_speed` decimal(10,2) DEFAULT 'NULL',
	`consumption_average` decimal(10,2) DEFAULT 'NULL',
	`odometer` decimal(10,2) DEFAULT 'NULL',
	`total_consumption` decimal(10,2) DEFAULT 'NULL',
	`total_breaking_on_high_speed` int(11) DEFAULT 'NULL',
	`total_breaking` int(11) DEFAULT 'NULL',
	`total_mileage` decimal(10,2) DEFAULT 'NULL',
	`created_at` timestamp DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `glg_metasperformance` (
	`mes` tinyint(4) NOT NULL,
	`ano` year(4) NOT NULL,
	`operacao` varchar(100) NOT NULL,
	`meta_individual_placa` decimal(15,2) NOT NULL,
	`meta_dedicado_operacao` decimal(15,2) NOT NULL,
	`meta_individual_km` decimal(15,2) NOT NULL,
	`id_logico` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `glg_nps` (
	`DataResposta` datetime NOT NULL,
	`Nome` varchar(150) DEFAULT 'NULL',
	`Empresa` varchar(150) DEFAULT 'NULL',
	`NotaAtendimentoComercial` tinyint(4) DEFAULT 'NULL',
	`NotaAtendimentoFinanceiro` tinyint(4) DEFAULT 'NULL',
	`NotaAtendimentoCliente` tinyint(4) DEFAULT 'NULL',
	`NotaAtendimentoOperacional` tinyint(4) DEFAULT 'NULL',
	`NotaServicoOperadorLogistico` tinyint(4) DEFAULT 'NULL',
	`NotaQualidadeEquipamentos` tinyint(4) DEFAULT 'NULL',
	`PontosPositivos` text DEFAULT 'NULL',
	`PontosMelhoria` text DEFAULT 'NULL',
	`NotaIndicacao` tinyint(4) DEFAULT 'NULL',
	`ComentarioFinal` text DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `glg_veiculos_operacao` (
	`data_inicio` date DEFAULT 'NULL',
	`data_update` date DEFAULT 'NULL',
	`veiculo` varchar(100) DEFAULT 'NULL',
	`grupo` varchar(100) DEFAULT 'NULL',
	`operacao` varchar(100) DEFAULT 'NULL',
	`placa` varchar(20) DEFAULT 'NULL',
	`motorista` varchar(100) DEFAULT 'NULL',
	`regional` varchar(50) DEFAULT 'NULL',
	`classificacao` varchar(50) DEFAULT 'NULL',
	`id_logico` varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mlt_conhecimentos` (
	`ChaveCTe` varchar(50) NOT NULL,
	`NumeroCTe` varchar(50) DEFAULT 'NULL',
	`Serie` varchar(10) DEFAULT 'NULL',
	`DataEmissao` datetime DEFAULT 'NULL',
	`NomeEmitente` varchar(255) DEFAULT 'NULL',
	`CNPJEmitente` varchar(20) DEFAULT 'NULL',
	`NomeDestinatario` varchar(255) DEFAULT 'NULL',
	`CNPJDestinatario` varchar(20) DEFAULT 'NULL',
	`MunicipioOrigem` varchar(100) DEFAULT 'NULL',
	`MunicipioDestino` varchar(100) DEFAULT 'NULL',
	`ValorPrestacao` decimal(10,2) DEFAULT 'NULL',
	`Modal` varchar(50) DEFAULT 'NULL',
	`TipoServico` varchar(50) DEFAULT 'NULL',
	`Situacao` varchar(50) DEFAULT 'NULL',
	`Localidade` varchar(50) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `ocorrencias_motoristas` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`data_hora` datetime DEFAULT 'current_timestamp()',
	`nome` varchar(100) NOT NULL,
	`carreta` varchar(50) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`tipo_ocorrencia` varchar(100) NOT NULL,
	`descricao` text NOT NULL,
	`latitude` decimal(10,6) DEFAULT 'NULL',
	`longitude` decimal(10,6) DEFAULT 'NULL',
	`maps_link` varchar(255) DEFAULT 'NULL',
	`user_agent` varchar(255) DEFAULT 'NULL',
	`cidade` varchar(100) DEFAULT 'NULL',
	`estado` varchar(100) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `sfw_tickets` (
	`id` bigint(20) NOT NULL,
	`status` varchar(50) DEFAULT 'NULL',
	`whatsappId` int(11) DEFAULT 'NULL',
	`queueId` int(11) DEFAULT 'NULL',
	`userId` int(11) DEFAULT 'NULL',
	`feedbackScore` int(11) DEFAULT 'NULL',
	`summary` text DEFAULT 'NULL',
	`createdAt` datetime DEFAULT 'NULL',
	`pendingAt` datetime DEFAULT 'NULL',
	`acceptedAt` datetime DEFAULT 'NULL',
	`solvedAt` datetime DEFAULT 'NULL',
	`closedAt` datetime DEFAULT 'NULL',
	`contact_id` bigint(20) DEFAULT 'NULL',
	`contact_name` varchar(255) DEFAULT 'NULL',
	`contact_email` varchar(255) DEFAULT 'NULL',
	`contact_number` varchar(50) DEFAULT 'NULL',
	`contact_profilePicUrl` text DEFAULT 'NULL',
	`tags` text DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `sorteio_inscricoes` (
	`id` char(36) NOT NULL DEFAULT 'uuid()',
	`full_name` varchar(160) NOT NULL,
	`cpf` char(11) NOT NULL,
	`draw_date` date NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	CONSTRAINT `uq_day_name` UNIQUE(`draw_date`,`full_name`),
	CONSTRAINT `uq_cpf` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `tdw_folhaponto` (
	`IdUnico` varchar(50) NOT NULL,
	`EmployerCode` varchar(10) DEFAULT 'NULL',
	`EmployeeNumber` varchar(20) DEFAULT 'NULL',
	`CH` int(11) DEFAULT 'NULL',
	`PayrollAttendanceType` varchar(50) DEFAULT 'NULL',
	`BaseDate` datetime DEFAULT 'NULL',
	`IN1` datetime DEFAULT 'NULL',
	`OUT1` datetime DEFAULT 'NULL',
	`IN2` datetime DEFAULT 'NULL',
	`OUT2` datetime DEFAULT 'NULL',
	`IN3` datetime DEFAULT 'NULL',
	`OUT3` datetime DEFAULT 'NULL',
	`RegularHours` decimal(10,4) DEFAULT 'NULL',
	`WorkedHours` decimal(10,4) DEFAULT 'NULL',
	`WorkedHoursDay` decimal(10,4) DEFAULT 'NULL',
	`WorkedHoursNight` decimal(10,4) DEFAULT 'NULL',
	`WorkedHoursNightCalc` decimal(10,4) DEFAULT 'NULL',
	`LateHoursCalc` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHours1` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHours1Percent` int(11) DEFAULT 'NULL',
	`OvertimeHours2` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHoursNight1` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHoursNight1Calc` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHoursNight1Percent` int(11) DEFAULT 'NULL',
	`OvertimeHoursNight2` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHoursNight2Calc` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHours3` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHoursNight3` decimal(10,4) DEFAULT 'NULL',
	`OvertimeHoursNight3Calc` decimal(10,4) DEFAULT 'NULL',
	`CompTime` decimal(10,4) DEFAULT 'NULL',
	`OnCall` decimal(10,4) DEFAULT 'NULL',
	`OnCallWorked` decimal(10,4) DEFAULT 'NULL',
	`Interwork` decimal(10,4) DEFAULT 'NULL',
	`Allowance` decimal(10,4) DEFAULT 'NULL',
	`OrdinaryHours` decimal(10,4) DEFAULT 'NULL',
	`OrdinaryNightHours` decimal(10,4) DEFAULT 'NULL',
	`OrdinaryNightCalcHours` decimal(10,4) DEFAULT 'NULL',
	`OrdinaryDiurnalHours` decimal(10,4) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `tkcs_basekm_kmrodado` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`chaveUnica` varchar(40) NOT NULL,
	`data` datetime DEFAULT 'NULL',
	`placa` char(7) DEFAULT 'NULL',
	`rodado_carregado` decimal(10,1) DEFAULT 'NULL',
	`rodado_vazio` decimal(10,1) DEFAULT 'NULL',
	`km_total` decimal(10,1) DEFAULT 'NULL',
	`ultimo_odometro` decimal(12,1) DEFAULT 'NULL',
	`ultimo_envio` datetime DEFAULT 'NULL',
	`ultima_macro` varchar(100) DEFAULT 'NULL',
	`ultimo_local` varchar(150) DEFAULT 'NULL',
	`ultimo_status` varchar(50) DEFAULT 'NULL',
	`veiID` bigint(20) DEFAULT 'NULL',
	`ultima_movimentacao` datetime DEFAULT 'NULL',
	`motivo_parada` varchar(150) DEFAULT 'NULL',
	`odometro_inicial` decimal(12,1) DEFAULT 'NULL',
	`odometro_final` decimal(12,1) DEFAULT 'NULL',
	`dt_inicial` datetime DEFAULT 'NULL',
	`dt_final` datetime DEFAULT 'NULL',
	`ultima_tfr_id` bigint(20) DEFAULT 'NULL',
	`motorista` varchar(120) DEFAULT 'NULL',
	CONSTRAINT `uk_chaveUnica` UNIQUE(`chaveUnica`)
);
--> statement-breakpoint
CREATE TABLE `tkcs_basekm_macrost` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`tfrID` bigint(20) DEFAULT 'NULL',
	`cod` int(11) DEFAULT 'NULL',
	`descricao` varchar(150) DEFAULT 'NULL',
	`status` varchar(50) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `tkcs_controle` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`chave` varchar(100) NOT NULL,
	`valor` varchar(255) NOT NULL,
	`atualizado_em` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `tkcs_dadosveiculos` (
	`id` bigint(20) unsigned AUTO_INCREMENT NOT NULL,
	`veiID` bigint(20) NOT NULL,
	`placa` char(7) DEFAULT 'NULL',
	`vs` decimal(4,2) DEFAULT 'NULL',
	`tCmd` int(11) DEFAULT 'NULL',
	`tMac` tinyint(1) DEFAULT 'NULL',
	`tp` int(11) DEFAULT 'NULL',
	`ta` int(11) DEFAULT 'NULL',
	`eqp` int(11) DEFAULT 'NULL',
	`loc` tinyint(1) DEFAULT 'NULL',
	`vManut` int(11) DEFAULT 'NULL',
	`valEspelhamento` date DEFAULT 'NULL',
	`propCancelamento` tinyint(1) DEFAULT 'NULL',
	`podeCompartilhar` tinyint(1) DEFAULT 'NULL',
	`tgsm` int(11) DEFAULT 'NULL',
	`ppc` tinyint(1) DEFAULT 'NULL',
	`tppc` int(11) DEFAULT 'NULL',
	`ppcMenor60` int(11) DEFAULT 'NULL',
	`chassi` varchar(30) DEFAULT 'NULL',
	`uManut` datetime DEFAULT 'NULL',
	`st1` tinyint(1) NOT NULL DEFAULT 0,
	`mot` varchar(120) DEFAULT 'NULL',
	`created_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` datetime NOT NULL DEFAULT 'current_timestamp()',
	CONSTRAINT `uk_veiid` UNIQUE(`veiID`)
);
--> statement-breakpoint
CREATE TABLE `wms_enderecos_proprietario` (
	`cdproprietario` decimal NOT NULL,
	`nmproprietario` varchar(60) NOT NULL,
	`cdendereco` decimal NOT NULL,
	`fgbloqueio` varchar(1) DEFAULT 'NULL',
	`fgocupado` varchar(1) NOT NULL,
	`endereco` varchar(304) DEFAULT 'NULL',
	`nmendereconv2` varchar(260) DEFAULT 'NULL',
	`nmendereconv3` varchar(216) DEFAULT 'NULL',
	`cdmaterialestoque` varchar(40) DEFAULT 'NULL',
	`dsmaterialestoque` varchar(120) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE TABLE `zev_workflows` (
	`id` int(11) NOT NULL,
	`masterInstanceId` int(11) DEFAULT 'NULL',
	`requestName` varchar(255) DEFAULT 'NULL',
	`reportLink` text DEFAULT 'NULL',
	`confirmationCode` varchar(50) DEFAULT 'NULL',
	`uid` char(36) DEFAULT 'NULL',
	`simulation` tinyint(1) DEFAULT 'NULL',
	`active` tinyint(1) DEFAULT 'NULL',
	`flowResult` varchar(100) DEFAULT 'NULL',
	`startDateTime` datetime DEFAULT 'NULL',
	`endDateTime` datetime DEFAULT 'NULL',
	`lastFinishedTaskDateTime` datetime DEFAULT 'NULL',
	`leadTimeInDays` decimal(10,2) DEFAULT 'NULL',
	`flow_id` int(11) DEFAULT 'NULL',
	`flow_uid` char(36) DEFAULT 'NULL',
	`flow_name` varchar(255) DEFAULT 'NULL',
	`flow_version` int(11) DEFAULT 'NULL',
	`requester_id` int(11) DEFAULT 'NULL',
	`requester_name` varchar(255) DEFAULT 'NULL',
	`requester_email` varchar(255) DEFAULT 'NULL',
	`requester_team_id` int(11) DEFAULT 'NULL',
	`requester_team_name` varchar(255) DEFAULT 'NULL',
	`requester_team_code` varchar(100) DEFAULT 'NULL',
	`requester_position_id` int(11) DEFAULT 'NULL',
	`requester_position_name` varchar(255) DEFAULT 'NULL',
	`requester_position_code` varchar(100) DEFAULT 'NULL',
	`number_cte` varchar(44) DEFAULT 'NULL',
	`operation_type` varchar(30) DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE INDEX `matricula` ON `elogios_internos` (`matricula`);--> statement-breakpoint
CREATE INDEX `idx_bloqueio_elogio` ON `elogios_motoristas` (`token_avaliador`,`carreta`,`data_registro`);--> statement-breakpoint
CREATE INDEX `idx_draw_date` ON `sorteio_inscricoes` (`draw_date`);--> statement-breakpoint
CREATE INDEX `idx_placa_data` ON `tkcs_basekm_kmrodado` (`placa`,`data`);--> statement-breakpoint
CREATE INDEX `idx_periodo` ON `tkcs_basekm_kmrodado` (`dt_inicial`,`dt_final`);--> statement-breakpoint
CREATE INDEX `idx_veiid` ON `tkcs_basekm_kmrodado` (`veiID`);--> statement-breakpoint
CREATE INDEX `idx_tfrID` ON `tkcs_basekm_macrost` (`tfrID`);--> statement-breakpoint
CREATE INDEX `idx_cod` ON `tkcs_basekm_macrost` (`cod`);--> statement-breakpoint
CREATE INDEX `idx_placa` ON `tkcs_dadosveiculos` (`placa`);
*/