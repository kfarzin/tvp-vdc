/**
 * ServiceNode represents a Docker Compose service configuration
 */
export interface ServiceNode {
  // Metadata properties
  container_name?: string;
  image?: string;
  build?: string | {
    context?: string;
    dockerfile?: string;
    args?: Record<string, string | number>;
    target?: string;
    shm_size?: string | number;
    cache_from?: string[];
    labels?: Record<string, string>;
    network?: string;
    extra_hosts?: string[] | Record<string, string>;
  };
  labels?: Record<string, string> | string[];

  // Networking properties
  networks?: string[] | Record<string, {
    aliases?: string[];
    ipv4_address?: string;
    ipv6_address?: string;
  }>;
  ports?: (string | number | {
    target?: number;
    published?: number | string;
    protocol?: 'tcp' | 'udp';
    mode?: 'host' | 'ingress';
  })[];
  expose?: string[] | number[];
  extra_hosts?: string[] | Record<string, string>;
  dns?: string | string[];

  // Storage properties
  volumes?: (string | {
    type?: 'volume' | 'bind' | 'tmpfs' | 'npipe';
    source?: string;
    target?: string;
    read_only?: boolean;
    bind?: {
      propagation?: string;
    };
    volume?: {
      nocopy?: boolean;
    };
  })[];
  tmpfs?: string | string[];
  configs?: (string | {
    source?: string;
    target?: string;
    uid?: string;
    gid?: string;
    mode?: number;
  })[];
  secrets?: (string | {
    source?: string;
    target?: string;
    uid?: string;
    gid?: string;
    mode?: number;
  })[];

  // Runtime/Resources properties
  command?: string | string[];
  entrypoint?: string | string[];
  environment?: Record<string, string | number | null> | string[];
  env_file?: string | string[] | {
    path: string;
    required?: boolean;
  }[];
  restart?: 'no' | 'always' | 'on-failure' | 'unless-stopped';
  stop_grace_period?: string;
  stop_signal?: string;
  user?: string;
  working_dir?: string;
  tty?: boolean;
  stdin_open?: boolean;
  privileged?: boolean;
  cap_add?: string[];
  cap_drop?: string[];
  init?: boolean;
  sysctls?: Record<string, string> | string[];
  ulimits?: Record<string, number | {
    soft: number;
    hard: number;
  }>;
  profiles?: string[];
  logging?: {
    driver?: string;
    options?: Record<string, string | number>;
  };
  deploy?: {
    resources?: {
      limits?: {
        cpus?: string;
        memory?: string;
      };
      reservations?: {
        cpus?: string;
        memory?: string;
      };
    };
    replicas?: number;
    restart_policy?: {
      condition?: string;
      delay?: string;
      max_attempts?: number;
      window?: string;
    };
  };
  healthcheck?: {
    test?: string | ['CMD' | 'CMD-SHELL' | 'NONE', ...string[]];
    interval?: string;
    timeout?: string;
    retries?: number;
    start_period?: string;
  };

  // Dependencies properties
  depends_on?: string[] | Record<string, {
    condition?: 'service_started' | 'service_healthy' | 'service_completed_successfully';
    required?: boolean;
    restart?: boolean;
  }>;
  links?: string[];
  external_links?: string[];
}

export default ServiceNode;
