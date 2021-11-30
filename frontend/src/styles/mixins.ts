interface ShadowProps {
  color: string,
}

export const shadowDreamy = (props: ShadowProps): string => (props.color
  ? `box-shadow: 0 1px 2px rgba(${props.color}, 0.07),
  0 2px 4px rgba(${props.color}, 0.07),
  0 4px 8px rgba(${props.color}, 0.07),
  0 8px 16px rgba(${props.color}, 0.07),
  0 16px 32px rgba(${props.color}, 0.07),
  0 32px 64px rgba(${props.color}, 0.07)`
  : 'box-shadow: none');

export const shadowShorter = (props: ShadowProps): string => (props.color
  ? `box-shadow: 0 1px 1px rgba(${props.color}, 0.11),
              0 2px 2px rgba(${props.color}, 0.11),
              0 4px 4px rgba(${props.color}, 0.11),
              0 6px 8px rgba(${props.color}, 0.11),
              0 8px 16px rgba(${props.color}, 0.11)`
  : 'box-shadow: none');

export const shadowLonger = (props: ShadowProps): string => (props.color
  ? `box-shadow: 0 2px 1px rgba(${props.color}, 0.09),
              0 4px 2px rgba(${props.color}, 0.09),
              0 8px 4px rgba(${props.color}, 0.09),
              0 16px 8px rgba(${props.color}, 0.09),
              0 32px 16px rgba(${props.color}, 0.09)`
  : 'box-shadow: none');

export const shadowSharp = (props: ShadowProps): string => (props.color
  ? `box-shadow: 0 1px 1px rgba(${props.color}, 0.25),
              0 2px 2px rgba(${props.color}, 0.20),
              0 4px 4px rgba(${props.color}, 0.15),
              0 8px 8px rgba(${props.color}, 0.10),
              0 16px 16px rgba(${props.color}, 0.05)`
  : 'box-shadow: none');

export const shadowDiffuse = (props: ShadowProps): string => (props.color
  ? `box-shadow: 0 1px 1px rgba(${props.color}, 0.08),
              0 2px 2px rgba(${props.color}, 0.12),
              0 4px 4px rgba(${props.color}, 0.16),
              0 8px 8px rgba(${props.color}, 0.20)`
  : 'box-shadow: none');

export const shadowSmooth = (props: ShadowProps): string => (props.color
  ? `box-shadow: 0 2.8px 2.2px rgba(${props.color}, 0.02),
              0 6.7px 5.3px rgba(${props.color}, 0.028),
              0 12.5px 10px rgba(${props.color}, 0.035),
              0 22.3px 17.9px rgba(${props.color}, 0.042),
              0 41.8px 33.4px rgba(${props.color}, 0.05),
              0 100px 80px rgba(${props.color}, 0.07)`
  : 'box-shadow: none');
