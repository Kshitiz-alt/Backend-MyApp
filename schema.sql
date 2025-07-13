--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: buyer_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buyer_orders (
    id integer NOT NULL,
    buyer_qty integer NOT NULL,
    buyer_price integer NOT NULL,
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: buyer_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.buyer_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: buyer_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.buyer_orders_id_seq OWNED BY public.buyer_orders.id;


--
-- Name: completed_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.completed_orders (
    id integer NOT NULL,
    price integer NOT NULL,
    qty integer NOT NULL,
    buyer_id integer,
    seller_id integer,
    completed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: completed_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.completed_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: completed_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.completed_orders_id_seq OWNED BY public.completed_orders.id;


--
-- Name: seller_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seller_orders (
    id integer NOT NULL,
    seller_qty integer NOT NULL,
    seller_price integer NOT NULL,
    is_completed boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: seller_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seller_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seller_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seller_orders_id_seq OWNED BY public.seller_orders.id;


--
-- Name: buyer_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyer_orders ALTER COLUMN id SET DEFAULT nextval('public.buyer_orders_id_seq'::regclass);


--
-- Name: completed_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_orders ALTER COLUMN id SET DEFAULT nextval('public.completed_orders_id_seq'::regclass);


--
-- Name: seller_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_orders ALTER COLUMN id SET DEFAULT nextval('public.seller_orders_id_seq'::regclass);


--
-- Name: buyer_orders buyer_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buyer_orders
    ADD CONSTRAINT buyer_orders_pkey PRIMARY KEY (id);


--
-- Name: completed_orders completed_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_orders
    ADD CONSTRAINT completed_orders_pkey PRIMARY KEY (id);


--
-- Name: seller_orders seller_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_orders
    ADD CONSTRAINT seller_orders_pkey PRIMARY KEY (id);


--
-- Name: completed_orders completed_orders_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_orders
    ADD CONSTRAINT completed_orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.buyer_orders(id);


--
-- Name: completed_orders completed_orders_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.completed_orders
    ADD CONSTRAINT completed_orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.seller_orders(id);


--
-- PostgreSQL database dump complete
--

