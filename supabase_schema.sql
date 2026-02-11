-- Create prayer_requests table
create table public.prayer_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  is_answered boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create afterthoughts (encouragements) table
create table public.afterthoughts (
  id uuid default gen_random_uuid() primary key,
  prayer_request_id uuid references public.prayer_requests on delete cascade not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create testimonies table
create table public.testimonies (
  id uuid default gen_random_uuid() primary key,
  prayer_request_id uuid references public.prayer_requests on delete cascade not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.prayer_requests enable row level security;

alter table public.afterthoughts enable row level security;

alter table public.testimonies enable row level security;

-- Policies for prayer_requests
create policy "Allow all prayer requests to be readonly" on public.prayer_requests for
select using (true);

create policy "Owners can add their own requests" on public.prayer_requests for
insert
with
    check (auth.uid () = user_id);

create policy "Owners can update their own requests" on public.prayer_requests for
update using (auth.uid () = user_id);

-- Policies for afterthoughts
create policy "Anyone can view afterthoughts" on public.afterthoughts for
select using (true);

create policy "Everyone can add encouragement unless answered" on public.afterthoughts for
insert
with
    check (
        auth.role () = 'authenticated'
        AND exists (
            select 1
            from public.prayer_requests
            where
                id = prayer_request_id
                and is_answered = false
        )
    );

-- Policies for testimonies
create policy "Anyone can view testimonies" on public.testimonies for
select using (true);

create policy "Only owners can add testimonies unless answered" on public.testimonies for
insert
with
    check (
        auth.uid () in (
            select user_id
            from public.prayer_requests
            where
                id = prayer_request_id
                and is_answered = false
        )
    );